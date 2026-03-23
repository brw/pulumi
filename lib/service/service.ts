import { local, remote } from "@pulumi/command";
import type { input } from "@pulumi/command/types";
import { Container, ContainerArgs, getRegistryImage, RemoteImage } from "@pulumi/docker";
import {
  ContainerCapabilities,
  ContainerLabel,
  ContainerMount,
  ContainerPort,
  ContainerVolume,
} from "@pulumi/docker/types/output";
import type { CustomResourceOptions, Input, InvokeOptions, Output, Resource } from "@pulumi/pulumi";
import { all, ComponentResource, output } from "@pulumi/pulumi";
import path from "path";
import { getEnv } from "~lib/env";
import { MountOpts } from "./mounts";
import { defaultNetwork } from "./networks";
import { convertPorts } from "./ports";
import { haringDockerProvider } from "./providers";

export const defaultConnection = {
  host: getEnv("CONNECTION_HOST"),
  user: getEnv("CONNECTION_USER"),
  port: parseInt(getEnv("CONNECTION_PORT"), 10),
  // password: getEnv("CONNECTION.PASSWORD"),
} satisfies input.remote.ConnectionArgs;

export type Env = string | number | boolean;
export type Port = number | string | ContainerPort;

export type ContainerServiceArgs = Partial<
  Omit<ContainerArgs, "ports" | "labels" | "mounts" | "envs" | "capabilities"> & {
    localImage: Input<string>;
    servicePort: Input<number>;
    subdomain: Input<string>;
    hostRule: Input<string>;
    hostRulePriority: Input<number>;
    ports: Input<Input<Port>[]>;
    middlewares: Input<Input<string>[]>;
    otherServicePorts: Input<Record<string, Input<number>>>;
    labels: Input<Record<string, Input<string | number>>>;
    mounts: Input<Input<MountOpts>[]>;
    envs: Input<Record<string, Input<Env | Env[]>>>;
    capabilities: Input<Input<string>[]> | ContainerCapabilities;
    internalHttps: Input<boolean>;
    commandConnection: Input<input.remote.ConnectionArgs>;
    monitor: Input<boolean>;
  }
>;

// TODO: turn ContainerService into a factory function like https://sst.dev/docs/examples/#api-gateway-auth
class ContainerService extends ComponentResource {
  public readonly image: Output<string>;
  public readonly container: Output<Container>;
  public readonly localUrl: Output<string>;
  public readonly host: Output<string>;
  public readonly ip: Output<string>;
  public readonly mounts: Output<ContainerMount[]> | undefined;
  public readonly volumes: Output<ContainerVolume[]> | undefined;
  public readonly labels: Output<ContainerLabel[]> | undefined;
  public readonly envs: Output<string[]>;
  public readonly capabilities: Output<ContainerCapabilities> | undefined;
  public readonly ports: Output<ContainerPort[]> | undefined;

  private commandConnection: Input<input.remote.ConnectionArgs>;
  private dependsOn: Resource[];

  constructor(name: string, args: ContainerServiceArgs, opts?: CustomResourceOptions) {
    super("bas:docker:ContainerService", name, args, opts);

    this.commandConnection = args.commandConnection ?? defaultConnection;

    this.dependsOn = [];
    output(opts?.dependsOn).apply((optsDependsOn) => {
      if (!optsDependsOn) return;

      if (Array.isArray(optsDependsOn)) {
        this.dependsOn.push(...optsDependsOn);
      } else {
        this.dependsOn.push(optsDependsOn);
      }
    });

    this.image = output(
      args.localImage ??
        new RemoteImage(
          `${name}`,
          {
            name: output(args.image ?? `lscr.io/linuxserver/${name}`).apply(async (image) => {
              if (!image.match(/\..+\//)) {
                image = `mirror.gcr.io/${image}`;
              }

              const registryImage = await getRegistryImage({ name: image }, { parent: this });
              return `${registryImage.name}@${registryImage.sha256Digest}`;
            }),
            keepLocally: true,
          },
          { parent: this },
        ).repoDigest,
    );

    this.mounts =
      args.mounts &&
      output(args.mounts).apply((mounts) => {
        let n = 0;
        for (const mount of mounts) {
          if (mount.type === "bind" && mount.source) {
            const dir = mount.kind === "file" ? path.dirname(mount.source) : mount.source;
            this.dependsOn.push(this.createRemoteDir(dir, name, n));
            n++;
          }

          delete mount.kind;
        }

        return mounts;
      });

    this.volumes = args.volumes && output(args.volumes);

    this.localUrl = all([args.networkMode, args.servicePort]).apply(([networkMode, servicePort]) =>
      servicePort && (networkMode === "host" || networkMode?.startsWith("container:"))
        ? `http://host.docker.internal:${servicePort}`
        : `http://${name}:${servicePort}`,
    );

    this.host = all([args.hostRule, args.subdomain]).apply(
      ([hostRule, subdomain]) => hostRule ?? `${subdomain ?? name}.bas.sh`,
    );

    const createLabels = all([
      args.middlewares ?? [],
      args.hostRulePriority,
      args.monitor,
      this.localUrl,
    ]).apply(([middlewares, hostRulePriority, monitor, localUrl]) => {
      return (host: string, port: string | number) => {
        const id = host.replaceAll(/[^\w]+/g, "-");

        const labels = {
          "traefik.enable": "true",
          [`traefik.http.services.${id}.loadbalancer.server.port`]: port.toString(),
          [`traefik.http.routers.${id}.service`]: `${id}`,
          [`traefik.http.routers.${id}.entrypoints`]: "https",
          [`traefik.http.routers.${id}.rule`]:
            host.includes("/") || host.includes("(") ? host : `Host(\`${host}\`)`,
          [`traefik.http.routers.${id}.middlewares`]: ["cloudflare", ...middlewares].join(","),
        };

        if (hostRulePriority) {
          labels[`traefik.http.routers.${id}.priority`] = hostRulePriority.toString();
        }

        if (port.toString() === "443") {
          labels[`traefik.http.services.${id}.loadbalancer.server.scheme`] = "https";
        }

        if (monitor) {
          labels[`kuma.${id}.http.name`] = name;
          labels[`kuma.${id}.http.url`] = localUrl;
        }

        return labels;
      };
    });

    this.labels = all([
      this.host,
      args.labels ?? {},
      args.servicePort,
      args.otherServicePorts ?? {},
      createLabels,
    ]).apply(([host, labels, servicePort, otherServicePorts, createLabels]) => {
      const additionalLabels = {};

      for (const [service, port] of Object.entries(otherServicePorts)) {
        let name = service;
        if (!name.includes(".bas.sh") && !name.includes("/")) {
          name += ".bas.sh";
        } else if (name.startsWith("/")) {
          name = name.slice(1);
        }

        Object.assign(additionalLabels, createLabels(name, port));
      }

      return Object.entries({
        ...(servicePort ? createLabels(host, servicePort) : {}),
        ...labels,
        ...additionalLabels,
      }).map(([label, value]) => ({ label, value: value.toString() }));
    });

    this.envs = output(args.envs).apply((envs) => [
      ...Object.entries({
        PUID: `${getEnv("PUID")}`,
        PGID: `${getEnv("PGID")}`,
        TZ: `${getEnv("TZ")}`,
        ...envs,
      }).map(([env, value]) => `${env}=${Array.isArray(value) ? value.join(",") : value}`),
    ]);

    this.ports = args.ports && output(args.ports).apply(convertPorts);

    this.capabilities =
      args.capabilities &&
      output(args.capabilities).apply((caps) => {
        const ensureCapPrefix = (cap: string) => (cap.startsWith("CAP_") ? cap : `CAP_${cap}`);

        if (Array.isArray(caps)) return { adds: caps.map(ensureCapPrefix) };

        caps.adds &&= caps.adds.map(ensureCapPrefix);
        caps.drops &&= caps.drops.map(ensureCapPrefix);
        return caps;
      });

    this.container = output(
      new Container(
        name,
        {
          ...args,
          image: this.image,
          ...(opts?.deleteBeforeReplace !== false && { name: args.name ?? name }),
          command: args.command,
          restart: args.restart ?? "unless-stopped",
          labels: this.labels,
          envs: this.envs,
          ports: this.ports,
          mounts: this.mounts,
          volumes: args.volumes,
          logDriver: "local",
          networkMode: args.networkMode ?? "bridge",
          // TODO: healthchecks
          // healthcheck: {tests}
          networksAdvanced: args.networkMode
            ? []
            : output(args.networksAdvanced ?? []).apply((networksAdvanced) => [
                ...networksAdvanced,
                { name: defaultNetwork.name },
              ]),
          hosts: args.networkMode
            ? []
            : output(args.hosts ?? []).apply((hosts) => [
                { host: "host.docker.internal", ip: "host-gateway" },
                ...hosts,
              ]),
          capabilities: this.capabilities,
        },
        {
          parent: this,
          deleteBeforeReplace: true,
          replaceOnChanges: ["mounts", "volumes"],
          ignoreChanges: opts?.ignoreChanges,
          dependsOn: this.dependsOn,
          ...opts,
        },
      ),
    );

    this.ip = all([args.networkMode, this.container.networkDatas, defaultNetwork.name]).apply(
      ([networkMode, networks, haringNetwork]) => {
        if (networkMode === "host") {
          return "host.docker.internal";
        } else if (networkMode?.startsWith("container")) {
          return ""; // TODO: container lookup
        }

        const net = networks?.find(
          (n) => n.networkName === haringNetwork || n.networkName === "bridge",
        );

        if (!net) {
          throw Error(
            `Could not find IP address on network ${haringNetwork} for container "${name}". Networks: ${JSON.stringify(networks)}`,
          );
        }

        return net.ipAddress;
      },
    );

    this.registerOutputs();
  }

  private createRemoteDir(path: string, name: string, index: number) {
    return new remote.Command(
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
      },
    );
  }

  static async remoteRun(args: local.RunArgs, opts?: InvokeOptions): Promise<local.RunResult> {
    const newArgs = {
      ...args,
      interpreter: [
        "/usr/bin/ssh",
        `-p ${defaultConnection.port}`,
        `${defaultConnection.user}@${defaultConnection.host}`,
      ],
    } satisfies local.RunArgs;

    return local.run(newArgs, {
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
