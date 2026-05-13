import { ContainerService } from "~lib/service";
import { confMount, ssdcacheMount } from "~lib/service/mounts";

export const prowlarrService = new ContainerService("prowlarr", {
  servicePort: 9696,
  mounts: [confMount("prowlarr"), ssdcacheMount()],
});
