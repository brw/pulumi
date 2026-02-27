import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const jackettService = new ContainerService("jackett", {
  servicePort: 9117,
  mounts: [confMount("jackett"), ssdcacheMount()],
});
