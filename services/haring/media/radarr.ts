import { ContainerService } from "~lib/service";
import { confMount, dataMount } from "~lib/service/mounts";

export const radarrService = new ContainerService("radarr", {
  servicePort: 7878,
  mounts: [confMount("radarr"), dataMount()],
});
