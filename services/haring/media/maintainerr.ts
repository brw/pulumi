import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const maintainerrService = new ContainerService("maintainerr", {
  image: "ghcr.io/jorenn92/maintainerr",
  servicePort: 6246,
  mounts: [confMount("maintainerr", "/opt/data")],
  middlewares: ["auth"],
});
