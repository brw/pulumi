import { ContainerService } from "~lib/service";
import { confMount } from "~lib/service/mounts";

export const autobrrService = new ContainerService("autobrr", {
  image: "ghcr.io/autobrr/autobrr",
  servicePort: 7474,
  mounts: [confMount("autobrr")],
});
