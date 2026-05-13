import { ContainerService } from "~lib/service";
import { confMount } from "~lib/service/mounts";

export const recyclarrService = new ContainerService("recyclarr", {
  image: "recyclarr/recyclarr",
  mounts: [confMount("recyclarr")],
});
