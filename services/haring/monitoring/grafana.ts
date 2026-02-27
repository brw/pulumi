import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const grafanaService = new ContainerService("grafana", {
  image: "grafana/grafana-oss",
  servicePort: 3000,
  mounts: [confMount("grafana", "/var/lib/grafana")],
  envs: {
    GF_INSTALL_PLUGINS: "grafana-piechart-panel",
  },
  user: "1000:1000",
});
