import { confMount, dataMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const radarrService = new ContainerService("radarr", {
  servicePort: 7878,
  mounts: [confMount("radarr"), dataMount()],
});
