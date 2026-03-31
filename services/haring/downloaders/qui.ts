import { DnsRecord } from "@pulumi/cloudflare";
import { getEnv } from "~lib/env";
import { confMount, dataMount, nvmeMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const quiService = new ContainerService("qui", {
  image: "ghcr.io/autobrr/qui",
  servicePort: 7476,
  user: "1000:1000",
  mounts: [confMount("qui"), dataMount(), nvmeMount()],
  envs: {
    QUI__METRICS_ENABLED: true,
  },
});

export const quiDnsRecord = new DnsRecord("qui", {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: "qui",
  ttl: 1,
  type: "CNAME",
  content: "haring.bas.sh",
  proxied: false,
});
