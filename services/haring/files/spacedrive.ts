import { interpolate } from "@pulumi/pulumi";
import { getEnv } from "~lib/env";
import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const spacedriveService = new ContainerService("spacedrive", {
  image: "ghcr.io/spacedriveapp/spacedrive/server",
  servicePort: 8080,
  mounts: [confMount("spacedrive", "/var/spacedrive"), ssdcacheMount()],
  envs: {
    SD_AUTH: interpolate`${getEnv("USERNAME")}:${getEnv("SPACEDRIVE_PASSWORD")}`,
  },
});
