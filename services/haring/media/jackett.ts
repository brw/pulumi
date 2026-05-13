import { ContainerService } from "~lib/service";
import { confMount, ssdcacheMount } from "~lib/service/mounts";

export const jackettService = new ContainerService("jackett", {
  servicePort: 9117,
  mounts: [confMount("jackett"), ssdcacheMount()],
});
