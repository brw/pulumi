import { dockerSocket } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

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
