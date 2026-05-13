import { ContainerService } from "~lib/service";
import { confMount } from "~lib/service/mounts";

export const ergoService = new ContainerService("ergo", {
  image: "ghcr.io/ergochat/ergo",
  servicePort: 6697,
  mounts: [confMount("ergo", "/ircd")],
  init: true,
});
