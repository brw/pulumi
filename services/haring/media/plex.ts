import { interpolate } from "@pulumi/pulumi";
import { ContainerService } from "~lib/service";
import { confMount, dataMount, gitMount } from "~lib/service/mounts";

import { wireguardProtonService } from "../networking/wireguard";

export const plexService = new ContainerService("plex", {
  servicePort: 32400,
  mounts: [confMount("plex"), dataMount(), gitMount()],
  networkMode: interpolate`container:${wireguardProtonService.container.id}`,
  cpuShares: 2048,
  monitor: true,
});
