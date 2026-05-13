import { ContainerService } from "~lib/service";
import { dockerSocket } from "~lib/service/mounts";

export const glancesService = new ContainerService("glances", {
  image: "nicolargo/glances",
  servicePort: 61208,
  ports: [61209],
  mounts: [dockerSocket],
  pidMode: "host",
  envs: {
    GLANCES_OPT: "-w",
  },
  middlewares: ["auth"],
});
