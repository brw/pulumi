import { getEnv } from "~lib/env";
import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const nextexplorerService = new ContainerService("nextexplorer", {
  image: "nxzai/explorer",
  servicePort: 3000,
  subdomain: "explorer",
  mounts: [
    confMount("nextexplorer/config", "/config"),
    confMount("nextexplorer/cache", "/cache"),
    ssdcacheMount("content", "/mnt/Content"),
  ],
  envs: {
    PUBLIC_URL: "https://explorer.bas.sh",
    SESSION_SECRET: getEnv("EXPLORER_SECRET"),
  },
});
