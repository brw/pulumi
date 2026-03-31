import { interpolate } from "@pulumi/pulumi";
import { confMount, dataMount, gitMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

import { wireguardProtonService } from "../networking/wireguard";

export const plexService = new ContainerService("plex", {
  servicePort: 32400,
  mounts: [confMount("plex"), dataMount(), gitMount()],
  networkMode: interpolate`container:${wireguardProtonService.container.id}`,
  cpuShares: 2048,
  monitor: true,
});
