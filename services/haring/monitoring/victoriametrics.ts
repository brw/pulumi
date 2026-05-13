import { ContainerService } from "~lib/service";
import { confMount } from "~lib/service/mounts";

export const victoriametricsService = new ContainerService("victoriametrics", {
  image: "victoriametrics/victoria-metrics",
  servicePort: 8428,
  mounts: [confMount("victoriametrics", "/victoria-metrics-data")],
  middlewares: ["auth"],
});
