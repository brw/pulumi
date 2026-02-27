import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const prowlarrService = new ContainerService("prowlarr", {
  servicePort: 9696,
  mounts: [confMount("prowlarr"), ssdcacheMount()],
});
