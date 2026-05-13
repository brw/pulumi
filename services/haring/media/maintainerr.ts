import { ContainerService } from "~lib/service";
import { confMount } from "~lib/service/mounts";

export const maintainerrService = new ContainerService("maintainerr", {
  image: "ghcr.io/jorenn92/maintainerr",
  servicePort: 6246,
  mounts: [confMount("maintainerr", "/opt/data")],
  middlewares: ["auth"],
});
