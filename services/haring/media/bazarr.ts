import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const bazarrService = new ContainerService("bazarr", {
  servicePort: 6767,
  mounts: [confMount("bazarr"), ssdcacheMount()],
});
