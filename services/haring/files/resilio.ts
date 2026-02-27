import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const resilioSyncService = new ContainerService("resilio-sync", {
  enabled: true,
  subdomain: "sync",
  servicePort: 8888,
  // ports: [55555, "55555/udp"],
  networkMode: "host",
  mounts: [confMount("resilio-sync"), ssdcacheMount(), ssdcacheMount("sync", "/sync")],
});
