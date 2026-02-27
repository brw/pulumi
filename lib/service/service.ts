import command from "@pulumi/command";
import type { input } from "@pulumi/command/types";
import docker from "@pulumi/docker";
import type { Input, Output } from "@pulumi/pulumi";
import pulumi, { all, output } from "@pulumi/pulumi";
import path from "path";
import { defaultNetwork } from "./networks";
import { convertLabels, convertEnvs } from "./util";
import { convertPorts } from "./ports";
import { getEnv } from "~lib/env";
import { haringDockerProvider } from "./providers";
import { MountOpts } from "./mounts";

export const defaultConnection = {
  host: getEnv("CONNECTION_HOST"),
  user: getEnv("CONNECTION_USER"),
  port: Number(getEnv("CONNECTION_PORT")),
  // password: getEnv("CONNECTION.PASSWORD"),
} satisfies input.remote.ConnectionArgs;

type Env = string | number | boolean;

export type ContainerServiceArgs = Partial<
  Omit<docker.ContainerArgs, "ports" | "labels" | "mounts" | "envs" | "capabilities"> & {
    enabled: boolean;
    localImage: Input<string>;
    disabled: boolean;
    servicePort: number;
    subdomain: string;
    hostRule: string;
    hostRulePriority: number;
    ports: Input<Input<number | string | docker.types.input.ContainerPort>[]>;
    middlewares: string[];
    otherServicePorts: Record<string, number>;
    labels: Input<Record<string, Input<string | number | undefined>> | undefined>;
    mounts: MountOpts[];
    envs: Input<Record<string, Input<Env | Env[]>>>;
    capabilities: string[] | { adds?: string[]; drops?: string[] };
    internalHttps: boolean;
    dontUpdateIf: () => boolean;
    commandConnection: input.remote.ConnectionArgs;
    monitor: boolean;
  }
>;

export class ServiceDef {}

// TODO: turn ContainerService into a factory function like https://sst.dev/docs/examples/#api-gateway-auth
class ContainerService extends pulumi.ComponentResource {
  public readonly container: docker.Container | undefined;
  public readonly localUrl: Output<string> | undefined;
  public readonly remoteUrl: string | undefined;
  public readonly ip: Output<string | undefined> | undefined;
  public readonly enabled: boolean;
  private readonly commandConnection: input.remote.ConnectionArgs;
  private readonly dependsOn: Input<pulumi.Resource>[] = [];

  constructor(name: string, _args: ContainerServiceArgs, opts?: pulumi.CustomResourceOptions) {
    super("bas:docker:ContainerService", name, _args, opts);

    const args = {
      enabled: true,
      disabled: false,
      ports: [],
      envs: {},
      mounts: [],
      middlewares: [],
      labels: {},
      otherServicePorts: {},
      networksAdvanced: [],
      hosts: [],
      commandConnection: defaultConnection,
      ..._args,
    } satisfies ContainerServiceArgs;

    this.commandConnection = args.commandConnection;

    if (!args.enabled || args.disabled) {
      this.enabled = false;
      return;
    }

    if (opts?.dependsOn) {
      this.dependsOn.push(...(Array.isArray(opts.dependsOn) ? opts.dependsOn : []));
    }

    const mounts = output(args.mounts).apply((mounts) => {
      let i = 0;
      for (const mount of mounts) {
        if (mount.type === "bind" && mount.source) {
          const dir = mount.kind === "file" ? path.dirname(mount.source) : mount.source;
          this.dependsOn.push(this.createRemoteDir(dir, name, i));
          i++;
        }

        delete mount.kind;
      }

      return mounts;
    });

    const image =
      args.localImage ??
      output(args.image).apply(async (image) =>
        docker
          .getRegistryImage({ name: image ?? `lscr.io/linuxserver/${name}` }, { parent: this })
          .then((registryImage) => `${registryImage.name}@${registryImage.sha256Digest}`),
      );

    // image = new docker.RemoteImage(
    //   `${name}`,
    //   {
    //     name: imageRef,
    //     keepLocally: true,
    //   },
    //   { parent: this },
    // ).repoDigest;

    function createLabels(host: string, port: string, priority?: number) {
      const id = host.replaceAll(/[^\w]+/g, "-");

      return {
        "traefik.enable": "true",
        [`traefik.http.services.${id}.loadbalancer.server.port`]: port,
        [`traefik.http.routers.${id}.service`]: id,
        [`traefik.http.routers.${id}.rule`]:
          host.includes("/") || host.includes("(") ? host : `Host(\`${host}\`)`,
        [`traefik.http.routers.${id}.entrypoints`]: "https",
        [`traefik.http.routers.${id}.middlewares`]: ["cloudflare", ...args.middlewares].join(","),
        ...(priority && {
          [`traefik.http.routers.${id}.priority`]: priority,
        }),
        ...(port === "443" && {
          [`traefik.http.services.${id}.loadbalancer.server.scheme`]: "https",
        }),
        ...(args.monitor && {
          [`kuma.${id}.http.name`]: name,
          [`kuma.${id}.http.url`]: `http://${name}:${port}`,
        }),
      };
    }

    let labels: Record<string, string | number> = {};
    if (args.servicePort) {
      this.localUrl = all([args.networkMode, args.servicePort]).apply(
        ([networkMode, servicePort]) =>
          networkMode === "host" || networkMode?.startsWith("container:")
            ? `http://host.docker.internal:${servicePort}`
            : `http://${name}:${servicePort}`,
      );
      const host = args.hostRule ?? `${args.subdomain ?? name}.bas.sh`;
      this.remoteUrl = `https://${host}`;

      labels = {
        ...labels,
        ...createLabels(host, args.servicePort.toString(), args.hostRulePriority),
      };
    }

    for (const service of Object.keys(args.otherServicePorts)) {
      let host = service;
      const port = args.otherServicePorts[service];

      if (!host.includes(".bas.sh") && !host.includes("/")) {
        host += ".bas.sh";
      } else if (host.startsWith("/")) {
        host = this.remoteUrl + host;
      }

      labels = {
        ...labels,
        ...createLabels(host, port.toString()),
      };
    }

    const allLabels = output(args.labels).apply((inputLabels) => ({
      ...labels,
      ...inputLabels,
    }));

    args.envs = output(args.envs).apply((envs) => ({
      PUID: `${getEnv("PUID")}`,
      PGID: `${getEnv("PGID")}`,
      TZ: `${getEnv("TZ")}`,
      ...envs,
    }));

    const capabilities = Array.isArray(args.capabilities)
      ? { adds: args.capabilities }
      : args.capabilities;

    const ensureCapPrefix = (cap: string) => (cap.startsWith("CAP_") ? cap : `CAP_${cap}`);

    if (capabilities) {
      capabilities.adds &&= capabilities.adds.map(ensureCapPrefix);
      capabilities.drops &&= capabilities.drops.map(ensureCapPrefix);
    }

    this.container = new docker.Container(
      name,
      {
        ...args,
        image,
        ...(opts?.deleteBeforeReplace !== false && { name: args.name ?? name }),
        command: args.command,
        restart: args.restart ?? "unless-stopped",
        labels: allLabels.apply(convertLabels),
        envs: convertEnvs(args.envs),
        ports: convertPorts(args.ports),
        mounts,
        volumes: args.volumes,
        logDriver: "local",
        networkMode: args.networkMode ?? "bridge",
        // TODO: healthchecks
        // healthcheck: {tests}
        networksAdvanced: args.networkMode
          ? []
          : pulumi
              .output(args.networksAdvanced)
              .apply((networksAdvanced) => [...networksAdvanced, { name: defaultNetwork.name }]),
        hosts: args.networkMode
          ? []
          : pulumi
              .output(args.hosts)
              .apply((hosts) => [{ host: "host.docker.internal", ip: "host-gateway" }, ...hosts]),
        capabilities,
      },
      {
        parent: this,
        deleteBeforeReplace: true,
        replaceOnChanges: ["mounts", "volumes"],
        ignoreChanges: opts?.ignoreChanges,
        dependsOn: this.dependsOn,
        ...opts,
      },
    );

    this.ip = pulumi
      .all([this.container.networkDatas, defaultNetwork.name])
      .apply(([networks, networkName]) => {
        const net = networks?.find((n) => n.networkName === networkName);
        return net?.ipAddress;
      });

    this.enabled = true;

    this.registerOutputs();
  }

  private createRemoteDir(path: string, name: string, index: number) {
    return new command.remote.Command(
      `mkdir-${name}-${index}`,
      {
        connection: this.commandConnection,
        create: `test -e "${path}" || mkdir -p "${path}"`,
        delete: path.includes("/")
          ? path
              .split("/")
              .slice(1)
              .map(
                (_segment, i, segments) =>
                  `rmdir "/${segments.slice(0, segments.length - i).join("/")}"`,
              )
              .join(" && ") + " || true"
          : undefined,
      },
      {
        parent: this,
        deleteBeforeReplace: true,
        // ignoreChanges: ["connection"],
      },
    );
  }

  static async remoteRun(
    args: command.local.RunArgs,
    opts?: pulumi.InvokeOptions,
  ): Promise<command.local.RunResult> {
    const newArgs = {
      ...args,
      interpreter: [
        "/usr/bin/ssh",
        `-p ${defaultConnection.port.toString()}`,
        `${defaultConnection.user}@${defaultConnection.host}`,
      ],
    } satisfies command.local.RunArgs;

    return command.local.run(newArgs, {
      ...opts,
    });
  }
}

class ContainerServiceWrapper extends ContainerService {
  constructor(...args: ConstructorParameters<typeof ContainerService>) {
    args[2] = {
      provider: haringDockerProvider,
      ...args[2],
    };

    super(...args);
  }
}

export { ContainerServiceWrapper as ContainerService };
