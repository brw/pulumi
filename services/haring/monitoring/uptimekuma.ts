import { getEnv } from "~lib/env";
import { confMount, dockerSocket } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const uptimekumaService = new ContainerService("uptimekuma", {
  image: "louislam/uptime-kuma:2",
  servicePort: 3001,
  subdomain: "status",
  mounts: [confMount("uptimekuma", "/app/data")],
  middlewares: ["auth"],
});

export const autokumaService = new ContainerService("autokuma", {
  enabled: false,
  image: "ghcr.io/bigboot/autokuma",
  mounts: [confMount("autokuma", "/data"), dockerSocket],
  envs: {
    AUTOKUMA__KUMA__URL: "http://uptimekuma:3001",
    AUTOKUMA__KUMA__USERNAME: getEnv("AUTOKUMA_USERNAME"),
    AUTOKUMA__KUMA__PASSWORD: getEnv("AUTOKUMA_PASSWORD"),
  },
});
