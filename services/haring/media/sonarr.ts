import { ContainerService } from "~lib/service";
import { confMount, dataMount } from "~lib/service/mounts";

export const sonarrService = new ContainerService("sonarr", {
  servicePort: 8989,
  image: "lscr.io/linuxserver/sonarr:develop",
  mounts: [confMount("sonarr"), dataMount()],
});
