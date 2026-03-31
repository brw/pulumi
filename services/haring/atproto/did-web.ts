import { ContainerService } from "~lib/service/service";
import didweb from "./did.json";
import { DnsRecord } from "@pulumi/cloudflare";
import { getEnv } from "~lib/env";

const CADDYFILE = `
  :80  {
    handle /.well-known/did.json {
      respond ${JSON.stringify(didweb)} 200
    }
  }
`;

export const didwebCaddyService = new ContainerService("didweb", {
  image: "caddy",
  servicePort: 80,
  hostRule: "Host(`bas.sh`) && Path(`/.well-known/did.json`)",
  hostRulePriority: 1000,
  command: ["/bin/sh", "-c", `echo '${CADDYFILE}' | caddy run --config - --adapter caddyfile`],
  middlewares: ["cors"],
});

export const didwebDnsRecord = new DnsRecord(`didweb`, {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: `also.bas.sh`,
  ttl: 1,
  type: "CNAME",
  content: "haring.bas.sh",
  proxied: false,
});

export const didwebDidDnsRecord = new DnsRecord(`didweb-did`, {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: `_atproto.also.bas.sh`,
  ttl: 1,
  type: "TXT",
  content: `"did=did:web:bas.sh"`,
});
