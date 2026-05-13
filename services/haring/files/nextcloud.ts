import { interpolate } from "@pulumi/pulumi";
import { getEnv } from "~lib/env";
import { ContainerService } from "~lib/service";
import { confMount, ssdcacheMount } from "~lib/service/mounts";

const valkeyNextcloudService = new ContainerService("valkey-nextcloud", {
  image: "valkey/valkey",
  command: [
    interpolate`--requirepass ${getEnv("VALKEY_PASSWORD")}`,
    "--save 60",
    "--loglevel warning",
  ],
  volumes: [{ volumeName: "valkey-unbound", containerPath: "/data" }],
});

const postgresNextcloudService = new ContainerService("postgres-nextcloud", {
  image: "postgres",
  volumes: [{ volumeName: "postgres-nextcloud", containerPath: "/var/lib/postgresql" }],
  envs: {
    POSTGRES_PASSWORD: getEnv("POSTGRES_PASSWORD"),
    POSTGRES_DB: "nextcloud",
  },
});

export const nextcloudService = new ContainerService("nextcloud", {
  servicePort: 443,
  mounts: [
    confMount("nextcloud"),
    confMount("nextcloud-data", "/data"),
    ssdcacheMount("", "/mnt/data"),
  ],
  envs: {
    DOCKER_MODS: "linuxserver/mods:nextcloud-notify-push|linuxserver/mods:nextcloud-mediadc",
    DATABASE_URL: interpolate`postgres://postgres:${getEnv("POSTGRES_PASSWORD")}@${postgresNextcloudService.container.name}/nextcloud`,
    DATABASE_PREFIX: "oc_",
    REDIS_URL: interpolate`redis://default:${getEnv("VALKEY_PASSWORD")}@${valkeyNextcloudService.container.name}`,
    NEXTCLOUD_URL: "https://nextcloud.bas.sh",
  },
});
