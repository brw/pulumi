import { ContainerService } from "~lib/service";
import { confMount, ssdcacheMount } from "~lib/service/mounts";

export const bazarrService = new ContainerService("bazarr", {
  servicePort: 6767,
  mounts: [confMount("bazarr"), ssdcacheMount()],
});
