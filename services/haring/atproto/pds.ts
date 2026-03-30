import { DnsRecord } from "@pulumi/cloudflare";
import { getEnv } from "~lib/env";
import { fetchRelays } from "~lib/relay-hosts";
import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const pdsService = new ContainerService("pds", {
  image: "ghcr.io/bluesky-social/pds",
  servicePort: 3000,
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
    "traefik.http.middlewares.pds-favicon.redirectregex.regex":
      "^https://pds\\.bas\\.sh/favicon\\.ico$",
    "traefik.http.middlewares.pds-favicon.redirectregex.replacement":
      "https://tranquil.bas.sh/favicon.ico",
    "traefik.http.routers.pds-favicon.entrypoints": "https",
    "traefik.http.routers.pds-favicon.rule": "Host(`pds.bas.sh`) && Path(`/favicon.ico`)",
    "traefik.http.routers.pds-favicon.middlewares": "cloudflare,pds-favicon",

    "traefik.http.middlewares.pds-age-assurance.plugin.staticresponse.statuscode": "200",
    "traefik.http.middlewares.pds-age-assurance.plugin.staticresponse.body":
      '{"state":{"lastInitiatedAt":"2025-07-14T14:22:43.912Z","status":"assured","access":"full"},"metadata":{"accountCreatedAt":"2022-11-17T00:35:16.391Z"}}',
    "traefik.http.routers.pds-age-assurance.rule":
      "Host(`pds.bas.sh`) && Path(`/xrpc/app.bsky.ageassurance.getState`)",
    "traefik.http.routers.pds-age-assurance.entrypoints": "https",
    "traefik.http.routers.pds-age-assurance.middlewares": "cloudflare,cors,json,pds-age-assurance",
  },
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
