import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const sabnzbdService = new ContainerService("sabnzbd", {
  servicePort: 8080,
  mounts: [confMount("sabnzbd"), ssdcacheMount()],
});
