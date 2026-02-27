import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const autobrrService = new ContainerService("autobrr", {
  image: "ghcr.io/autobrr/autobrr",
  servicePort: 7474,
  mounts: [confMount("autobrr")],
});
