import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const recyclarrService = new ContainerService("recyclarr", {
  image: "recyclarr/recyclarr",
  mounts: [confMount("recyclarr")],
});
