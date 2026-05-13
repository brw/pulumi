import { ContainerService } from "~lib/service";
import { confMount, ssdcacheMount } from "~lib/service/mounts";

export const fileStashService = new ContainerService("filestash", {
  image: "machines/filestash",
  servicePort: 8334,
  mounts: [confMount("filestash", "/app/data/state"), ssdcacheMount()],
  envs: {
    APPLICATION_URL: "filestash.bas.sh",
    CANARY: true,
  },
});
