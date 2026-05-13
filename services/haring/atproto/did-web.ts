import { DnsRecord } from "@pulumi/cloudflare";
import { getEnv } from "~lib/env";
import { ContainerService } from "~lib/service";

const DID_WEB = {
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/multikey/v1",
    "https://w3id.org/security/suites/secp256k1-2019/v1",
  ],
  id: "did:web:bas.sh",
  alsoKnownAs: ["at://also.bas.sh"],
  verificationMethod: [
    {
      id: "did:web:bas.sh#atproto",
      type: "Multikey",
      controller: "did:web:bas.sh",
      publicKeyMultibase: "zQ3sheGf8QLgkN6kv7AdwefVrF5j3rB9bNyDSeA2PRcAFvNZJ",
    },
  ],
  service: [
    {
      id: "#atproto_pds",
      type: "AtprotoPersonalDataServer",
      serviceEndpoint: "https://tranquil.bas.sh",
    },
  ],
};

const CADDYFILE = `
  :80  {
    handle /.well-known/did.json {
      respond ${JSON.stringify(DID_WEB)} 200
    }
  }
`;

export const didwebCaddyService = new ContainerService("caddy-didweb", {
  image: "caddy",
  servicePort: 80,
  hostRule: "Host(`bas.sh`) && Path(`/.well-known/did.json`)",
  hostRulePriority: 1000,
  command: ["/bin/sh", "-c", `echo '${CADDYFILE}' | caddy run --config - --adapter caddyfile`],
  middlewares: ["cors"],
});

export const didwebDnsRecord = new DnsRecord("didweb", {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: "also.bas.sh",
  ttl: 1,
  type: "CNAME",
  content: "haring.bas.sh",
  proxied: false,
});

export const didwebDidDnsRecord = new DnsRecord("didweb-did", {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: "_atproto.also.bas.sh",
  ttl: 1,
  type: "TXT",
  content: '"did=did:web:bas.sh"',
});
