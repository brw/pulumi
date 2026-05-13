import { ContainerService } from "~lib/service";
import { confMount, ssdcacheMount } from "~lib/service/mounts";

export const sabnzbdService = new ContainerService("sabnzbd", {
  servicePort: 8080,
  mounts: [confMount("sabnzbd"), ssdcacheMount()],
});
