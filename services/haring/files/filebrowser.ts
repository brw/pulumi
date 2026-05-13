import { getEnv } from "~lib/env";
import { ContainerService } from "~lib/service";
import { confMount, ssdcacheMount } from "~lib/service/mounts";

export const filebrowserService = new ContainerService("filebrowser", {
  image: "ghcr.io/gtsteffaniak/filebrowser:beta",
  servicePort: 80,
  user: "1000:1000",
  mounts: [
    confMount("filebrowser", "/home/filebrowser/data"),
    ssdcacheMount("content", "/home/filebrowser/content"),
  ],
  envs: {
    FILEBROWSER_CONFIG: "data/config.yaml",
    FILEBROWSER_ADMIN_PASSWORD: getEnv("FILEBROWSER_ADMIN_PASSWORD"),
  },
  cpuShares: 512,
});
