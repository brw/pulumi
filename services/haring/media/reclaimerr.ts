import { ContainerService } from "~lib/service";
import { confMount, ssdcacheMount } from "~lib/service/mounts";

export const reclaimerrService = new ContainerService("reclaimerr", {
  image: "ghcr.io/jessielw/reclaimerr",
  servicePort: 8000,
  mounts: [confMount("reclaimerr", "/app/data"), ssdcacheMount("plex")],
  envs: {
    CORS_ORIGINS: "https://reclaimerr.bas.sh",
  },
});
