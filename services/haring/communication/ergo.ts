import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const ergoService = new ContainerService("ergo", {
  image: "ghcr.io/ergochat/ergo",
  servicePort: 6697,
  mounts: [confMount("ergo", "/ircd")],
  init: true,
});
