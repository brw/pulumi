import { ContainerService } from "~lib/service/service";
import dockerBuild from "@pulumi/docker-build";
import { getEnv } from "~lib/env";
import { interpolate } from "@pulumi/pulumi";
import { confMount, dataMount } from "~lib/service/mounts";
import { getLatestCommit } from "~lib/util";

const postgresRelayService = new ContainerService("postgres-relay", {
  image: "postgres",
  mounts: [confMount("postgres-relay", "/var/lib/postgresql")],
  envs: {
    POSTGRES_PASSWORD: getEnv("POSTGRES_PASSWORD"),
    POSTGRES_DB: "relay",
  },
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

export const relayService = new ContainerService("relay", {
  localImage: interpolate`${relayImage.ref}@${relayImage.digest}`,
  servicePort: 2470,
  networkMode: "host",
  mounts: [dataMount("media/relay", "/data/relay/persist")],
  middlewares: ["relay"],
  envs: {
    RELAY_ADMIN_PASSWORD: getEnv("RELAY_ADMIN_PASSWORD"),
    DATABASE_URL: interpolate`postgres://postgres:${getEnv("POSTGRES_PASSWORD")}@${postgresRelayService.ip}/relay`,
    RELAY_PERSIST_DIR: "/data/relay/persist",
    RELAY_REPLAY_WINDOW: "24h",
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
    ],
  },
});
