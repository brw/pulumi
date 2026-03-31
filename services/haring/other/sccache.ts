import path from "path";

import { Image } from "@pulumi/docker-build";
import { interpolate } from "@pulumi/pulumi";
import { getEnv } from "~lib/env";
import { defaultNetwork } from "~lib/service/networks";
import { ContainerService } from "~lib/service/service";
import { getLatestTag } from "~lib/util";

import { STATIC_IPS } from "../ips";

export const sccacheImage = new Image("sccache-scheduler", {
  tags: ["sccache-scheduler:latest"],
  context: {
    location: path.join(import.meta.dirname, "sccache"),
  },
  buildArgs: {
    VERSION: getLatestTag("mozilla/sccache"),
  },
  exports: [
    {
      docker: {
        compression: "zstd",
        forceCompression: true,
      },
      // https://github.com/pulumi/pulumi-docker-build/issues/498
      // oci: {
      //   compression: "estargz",
      //   forceCompression: true,
      // },
    },
  ],
  push: false,
  buildOnPreview: false,
});

export const sccacheSchedulerService = new ContainerService("sccache-scheduler", {
  localImage: sccacheImage.digest,
  servicePort: 10600,
  envs: {
    AUTH_TOKEN: getEnv("SCCACHE_AUTH_TOKEN"),
    SCCACHE_ROLE: "scheduler",
    SCCACHE_LOG: "info",
  },
  restart: "on-failure",
  maxRetryCount: 3,
});

export const sccacheServerService = new ContainerService("sccache-server", {
  localImage: sccacheImage.digest,
  servicePort: 10501,
  envs: {
    AUTH_TOKEN: getEnv("SCCACHE_AUTH_TOKEN"),
    SCHEDULER_ADDR: interpolate`http://${sccacheSchedulerService.ip}:${sccacheSchedulerService.servicePort}`,
    SCCACHE_ROLE: "server",
    SCCACHE_LOG: "info",
    SERVER_ADDR: STATIC_IPS.SCCACHE_SERVER,
  },
  networksAdvanced: [{ name: defaultNetwork.name, ipv4Address: STATIC_IPS.SCCACHE_SERVER }],
  restart: "on-failure",
  maxRetryCount: 3,
});
