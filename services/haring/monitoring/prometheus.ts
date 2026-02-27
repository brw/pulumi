import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const prometheusService = new ContainerService("prometheus", {
  image: "prom/prometheus",
  servicePort: 9090,
  mounts: [confMount("prometheus", "/etc/prometheus")],
  volumes: [
    {
      volumeName: "prometheus",
      containerPath: "/prometheus",
    },
  ],
  command: [
    "--config.file=/etc/prometheus/prometheus.yml",
    "--storage.tsdb.path=/prometheus",
    "--web.console.libraries=/etc/prometheus/console_libraries",
    "--web.console.templates=/etc/prometheus/consoles",
  ],
  middlewares: ["auth"],
});
