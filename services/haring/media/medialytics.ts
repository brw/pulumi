import { getEnv } from "~lib/env";
import { ContainerService } from "~lib/service/service";
import { plexService } from "./plex";

let medialyticsService: ContainerService | undefined;

if (plexService?.localUrl) {
  medialyticsService = new ContainerService("medialytics", {
    image: "ghcr.io/drewpeifer/medialytics",
    servicePort: 80,
    envs: {
      SERVER_IP: "https://plex.bas.sh:443",
      SERVER_TOKEN: getEnv("PLEX_TOKEN"),
    },
    middlewares: ["auth"],
  });
}

export { medialyticsService };
