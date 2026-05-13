import { ContainerService } from "~lib/service";

export const whoamiService = new ContainerService("whoami", {
  image: "ghcr.io/traefik/whoami",
  servicePort: 80,
});
