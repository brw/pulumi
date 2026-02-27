import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const seerrService = new ContainerService("seerr", {
  image: "ghcr.io/seerr-team/seerr",
  servicePort: 5055,
  subdomain: "request",
  mounts: [confMount("seerr", "/app/config")],
  init: true,
  monitor: true,
});
