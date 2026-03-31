import { ContainerService } from "~lib/service/service";
import dockerBuild from "@pulumi/docker-build";
import { getEnv } from "~lib/env";
import { interpolate } from "@pulumi/pulumi";
import { confMount, dataMount } from "~lib/service/mounts";
import { getLatestCommit } from "~lib/util";
import { unboundService } from "../networking/unbound/unbound";
import { STATIC_IPS } from "../ips";
import { defaultNetwork } from "~lib/service/networks";

const postgresRelayService = new ContainerService("postgres-relay", {
  image: "postgres",
  mounts: [confMount("postgres-relay", "/var/lib/postgresql")],
  envs: {
    POSTGRES_PASSWORD: getEnv("POSTGRES_PASSWORD"),
    POSTGRES_DB: "relay",
  },
  networksAdvanced: [{ name: defaultNetwork.name, ipv4Address: STATIC_IPS.POSTGRES_RELAY }],
});

const relayImage = new dockerBuild.Image(
  "relay",
  {
    tags: ["relay:latest"],
    context: {
      location: "https://github.com/bluesky-social/indigo.git",
    },
    dockerfile: {
      location: "https://github.com/bluesky-social/indigo/raw/refs/heads/main/cmd/relay/Dockerfile",
    },
    buildArgs: {
      BUILDKIT_CONTEXT_KEEP_GIT_DIR: "true",
    },
    exports: [
      {
        docker: {},
      },
    ],
    push: false,
    buildOnPreview: false,
  },
  {
    // replacementTrigger: await getLatestCommit(
    //   "https://github.com/bluesky-social/indigo/commits/main/cmd/relay",
    // ),
  },
);

const RELAY_MOTD = `
                「Become a magical girl today!」
                /
    ／人◕ ‿‿ ◕人＼


This is an atproto [https://atproto.com] relay instance, running the 'relay' codebase [https://github.com/bluesky-social/indigo]

The firehose WebSocket path is at:  /xrpc/com.atproto.sync.subscribeRepos
`;

const CADDYFILE = `
  :80  {
    respond "${RELAY_MOTD}" 200
  }
`;

export const relayCaddyService = new ContainerService("caddy-relay", {
  image: "caddy",
  servicePort: 80,
  hostRule: "Host(`relay.bas.sh`) && Path(`/`)",
  hostRulePriority: 1000,
  command: ["/bin/sh", "-c", `echo '${CADDYFILE}' | caddy run --config - --adapter caddyfile`],
  middlewares: ["cors"],
  labels: {
    "traefik.http.middlewares.relay-favicon.redirectregex.regex":
      "^https://relay\\.bas\\.sh/favicon\\.ico$",
    "traefik.http.middlewares.relay-favicon.redirectregex.replacement":
      "https://tranquil.bas.sh/favicon.ico",
    "traefik.http.routers.relay-favicon.entrypoints": "https",
    "traefik.http.routers.relay-favicon.rule": "Host(`relay.bas.sh`) && Path(`/favicon.ico`)",
    "traefik.http.routers.relay-favicon.middlewares": "cloudflare,relay-favicon",
  },
});

export const relayService = new ContainerService(
  "relay",
  {
    localImage: interpolate`${relayImage.ref}@${relayImage.digest}`,
    servicePort: 2470,
    networkMode: "host",
    mounts: [dataMount("media/relay", "/data/relay/persist")],
    middlewares: ["relay"],
    dns: [STATIC_IPS.UNBOUND],
    envs: {
      RELAY_ADMIN_PASSWORD: getEnv("RELAY_ADMIN_PASSWORD"),
      DATABASE_URL: interpolate`postgres://postgres:${getEnv("POSTGRES_PASSWORD")}@${postgresRelayService.ip}/relay`,
      RELAY_PERSIST_DIR: "/data/relay/persist",
      RELAY_REPLAY_WINDOW: "24h",
      RELAY_LENIENT_SYNC_VALIDATION: true,
      MAX_DB_CONNECTIONS: 80,
      RELAY_HOST_CONCURRENCY: 80,
      RELAY_DEFAULT_REPO_LIMIT: 1000,
      RELAY_TRUSTED_DOMAINS: [
        "*.host.bsky.network",
        "atproto.brid.gy",
        "blacksky.app",
        "northsky.social",
        "tngl.sh",
        "pds.sprk.so",
        "roomy.chat",
        "selfhosted.social",
        "eurosky.social",
        "pds.witchcraft.systems",
        "npmx.social",
        "*.stream.place",
      ],
    },
  },
  {
    dependsOn: unboundService.container,
  },
);
