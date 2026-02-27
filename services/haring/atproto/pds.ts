import { DnsRecord } from "@pulumi/cloudflare";
import { getEnv } from "~lib/env";
import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const PDS_CRAWLERS = [
  "https://bsky.network",
  "https://relay1.us-east.bsky.network",
  "https://relay1.us-west.bsky.network",
  "https://relay.upcloud.world",
  "https://relay3.fr.hose.cam",
  "https://relay.fire.hose.cam",
  "https://relay.feeds.blue",
  "https://atproto.africa",
  "https://relay.hayescmd.net",
  "https://relay.xero.systems",
  "https://europe.firehose.network",
  "https://northamerica.firehose.network",
  "https://asia.firehose.network",
  "https://relay.bas.sh",
  "https://relay.t4tlabs.net",
];

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
    PDS_DID_PLC_URL: "https://plc.directory",
    PDS_BSKY_APP_VIEW_URL: "https://api.bsky.app",
    PDS_BSKY_APP_VIEW_DID: "did:web:api.bsky.app",
    PDS_REPORT_SERVICE_URL: "https://mod.bsky.app",
    PDS_REPORT_SERVICE_DID: "did:plc:ar7c4by46qjdydhdevvrndac",
    PDS_CRAWLERS,
    LOG_ENABLED: "true",
    PDS_EMAIL_SMTP_URL: getEnv("PDS_SMTP_AUTH_URI"),
    PDS_EMAIL_FROM_ADDRESS: "PDS <pds@bas.sh>",
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
