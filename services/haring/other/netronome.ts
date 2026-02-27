import { DnsRecord } from "@pulumi/cloudflare";
import { getEnv } from "~lib/env";
import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const netronomeService = new ContainerService("netronome", {
  image: "ghcr.io/autobrr/netronome",
  servicePort: 7575,
  mounts: [confMount("netronome", "/data")],
});

export const netronomeDnsRecord = new DnsRecord("netronome", {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: "netronome",
  type: "CNAME",
  ttl: 1,
  content: "haring.bas.sh",
  proxied: false,
});
