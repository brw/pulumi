import { interpolate } from "@pulumi/pulumi";
import { getEnv } from "~lib/env";
import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const nextCloudService = new ContainerService("nextcloud", {
  servicePort: 443,
  mounts: [
    confMount("nextcloud"),
    confMount("nextcloud-data", "/data"),
    ssdcacheMount("", "/mnt/data"),
  ],
  envs: {
    DOCKER_MODS: "linuxserver/mods:nextcloud-notify-push|linuxserver/mods:nextcloud-mediadc",
    DATABASE_URL: interpolate`postgres://postgres:${getEnv("POSTGRES_PASSWORD")}@postgres/nextcloud`,
    DATABASE_PREFIX: "oc_",
    REDIS_URL: interpolate`redis://default:${getEnv("VALKEY_PASSWORD")}@valkey`,
    NEXTCLOUD_URL: "https://nextcloud.bas.sh",
  },
});

if (nextCloudService.container) {
  const valkeyService = new ContainerService("valkey", {
    image: "valkey/valkey",
    command: [interpolate`--requirepass ${getEnv("VALKEY_PASSWORD")}`],
  });

  const postgresService = new ContainerService("postgres", {
    image: "postgres",
    volumes: [
      {
        volumeName: "postgres",
        containerPath: "/var/lib/postgresql",
      },
    ],
    envs: {
      POSTGRES_PASSWORD: getEnv("POSTGRES_PASSWORD"),
      POSTGRES_DB: "nextcloud",
    },
  });
}
