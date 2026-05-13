import path from "path";

import { DnsRecord } from "@pulumi/cloudflare";
import { remote } from "@pulumi/command";
import { asset, output } from "@pulumi/pulumi";
import { getEnv } from "~lib/env";
import { fetchRelays } from "~lib/relay-hosts";
import { ContainerService, defaultConnection } from "~lib/service";
import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { toHostRule } from "~lib/util";

const SUBDOMAINS = ["pds"];
const HANDLE_DOMAINS = SUBDOMAINS.map((subdomain) => `${subdomain}.bas.sh`);
const WILDCARD_HOSTS = HANDLE_DOMAINS.map((domain) => `*.${domain}`);

export const pdsService = new ContainerService("pds", {
  image: "ghcr.io/bluesky-social/pds",
  servicePort: 3000,
  hostRule: toHostRule([...HANDLE_DOMAINS, ...WILDCARD_HOSTS]),
  mounts: [confMount("pds", "/pds")],
  envs: {
    PDS_HOSTNAME: "pds.bas.sh",
    PDS_JWT_SECRET: getEnv("PDS_JWT_SECRET"),
    PDS_ADMIN_PASSWORD: getEnv("PDS_ADMIN_PASSWORD"),
    PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX: getEnv("PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX"),
    PDS_DATA_DIRECTORY: "/pds",
    PDS_BLOBSTORE_DISK_LOCATION: "/pds/blocks",
    PDS_BLOB_UPLOAD_LIMIT: "2147483648",
    PDS_RATE_LIMITS_ENABLED: false,
    PDS_DID_PLC_URL: "https://plc.directory",
    PDS_BSKY_APP_VIEW_URL: "https://api.bsky.app",
    PDS_BSKY_APP_VIEW_DID: "did:web:api.bsky.app",
    PDS_REPORT_SERVICE_URL: "https://mod.bsky.app",
    PDS_REPORT_SERVICE_DID: "did:plc:ar7c4by46qjdydhdevvrndac",
    PDS_CRAWLERS: fetchRelays(),
    LOG_ENABLED: "true",
    PDS_EMAIL_SMTP_URL: getEnv("PDS_SMTP_AUTH_URI"),
    PDS_EMAIL_FROM_ADDRESS: "PDS <pds@bas.sh>",
  },
  labels: {
    "traefik.http.routers.pds-user-redirect.entrypoints": "https",
    "traefik.http.routers.pds-user-redirect.rule": `(${toHostRule(WILDCARD_HOSTS)}) && !PathPrefix(\`/.well-known\`)`,
    "traefik.http.routers.pds-user-redirect.middlewares": "cloudflare,bsky-user-redirect",
    "traefik.http.routers.pds-user-redirect.priority": 1000,

    "traefik.http.middlewares.pds-favicon.redirectregex.regex": "^https://.+/favicon\\.ico$",
    "traefik.http.middlewares.pds-favicon.redirectregex.replacement":
      "https://tranquil.bas.sh/favicon.ico",
    "traefik.http.routers.pds-favicon.entrypoints": "https",
    "traefik.http.routers.pds-favicon.rule": `(${toHostRule(HANDLE_DOMAINS)}) && Path(\`/favicon.ico\`)`,
    "traefik.http.routers.pds-favicon.middlewares": "cloudflare,pds-favicon",
  },
});

const PDS_MOTD = `
           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡀
           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⠙⠻⢶⣄⡀⠀⠀⠀⢀⣤⠶⠛⠛⡇
           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣇⠀⠀⣙⣿⣦⣤⣴⣿⣁⠀⠀⣸⠇
           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣡⣾⣿⣿⣿⣿⣿⣿⣿⣷⣌⠋⠀
           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⣷⣄⡈⢻⣿⡟⢁⣠⣾⣿⣦⠀
           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⣿⣿⣿⠘⣿⠃⣿⣿⣿⣿⡏⠀
           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠈⠛⣰⠿⣆⠛⠁⠀⡀⠀⠀
           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⣿⣦⠀⠘⠛⠋⠀⣴⣿⠁⠀⠀
           ⠀⠀⠀⠀⠀⠀⣀⣤⣶⣾⣿⣿⣿⣿⡇⠀⠀⠀⢸⣿⣏⠀⠀⠀
           ⠀⠀⠀⣠⣶⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠀⠀⠀⠾⢿⣿⠀⠀⠀
           ⠀⣠⣿⣿⣿⣿⣿⣿⡿⠟⠋⣁⣠⣤⣤⡶⠶⠶⣤⣄⠈⠀⠀⠀
           ⢰⣿⣿⣮⣉⣉⣉⣤⣴⣶⣿⣿⣋⡥⠄⠀⠀⠀⠀⠉⢻⣄⠀⠀
           ⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣋⣁⣤⣀⣀⣤⣤⣤⣤⣄⣿⡄⠀
           ⠀⠙⠿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠛⠋⠉⠁⠀⠀⠀⠀⠈⠛⠃⠀
           ⠀⠀⠀⠀⠉⠉⠉⠉⠉

This is an AT Protocol Personal Data Server (aka, an atproto PDS)

Most API routes are under /xrpc/

      Code: https://github.com/bluesky-social/atproto
 Self-Host: https://github.com/bluesky-social/pds
  Protocol: https://atproto.com
`.slice(1);

const CADDYFILE = `
  :80  {
    handle /xrpc/app.bsky.ageassurance.getState {
      respond {"state":{"lastInitiatedAt":"2025-07-14T14:22:43.912Z","status":"assured","access":"full"},"metadata":{"accountCreatedAt":"2022-11-17T00:35:16.391Z"}} 200
    }

    handle / {
      respond "${PDS_MOTD}" 200
    }
  }
`;

export const pdsCaddyService = new ContainerService("pds-web", {
  image: "caddy",
  servicePort: 80,
  hostRule: "Host(`pds.bas.sh`) && (Path(`/`) || Path(`/xrpc/app.bsky.ageassurance.getState`))",
  hostRulePriority: 1000,
  command: ["/bin/sh", "-c", `echo '${CADDYFILE}' | caddy run --config - --adapter caddyfile`],
  middlewares: ["cors"],
});

export const pdsDnsRecord = new DnsRecord("pds", {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: "pds.bas.sh",
  ttl: 1,
  type: "CNAME",
  content: "haring.bas.sh",
  proxied: false,
});

export const pdsWildcardDnsRecord = new DnsRecord("pds-wildcard", {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: "*.pds.bas.sh",
  ttl: 1,
  type: "CNAME",
  content: "pds.bas.sh",
  proxied: false,
});
