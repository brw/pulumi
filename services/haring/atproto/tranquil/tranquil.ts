import { asset, interpolate } from "@pulumi/pulumi";
import { getEnv } from "~lib/env";
import { _mount, confMount, mount } from "~lib/service/mounts";
import { ContainerService, defaultConnection } from "~lib/service/service";
import dockerBuild from "@pulumi/docker-build";
import { remote } from "@pulumi/command";
import { getLatestCommit } from "~lib/util";
import { fetchRelays } from "~lib/relay-hosts";
import path from "path";
import { DnsRecord } from "@pulumi/cloudflare";

const tranquilImage = new dockerBuild.Image(
  "tranquil-pds",
  {
    tags: ["tranquil-pds:latest"],
    context: {
      location: "https://tangled.org/tranquil.farm/tranquil-pds.git",
    },
    buildArgs: {
      BUILDKIT_CONTEXT_KEEP_GIT_DIR: "true",
    },
    exports: [
      {
        docker: {},
      },
    ],
    push: false,
    buildOnPreview: false,
  },
  {
    replacementTrigger: await getLatestCommit(
      "https://tangled.org/tranquil.farm/tranquil-pds/commits/main",
    ),
    customTimeouts: {
      create: "30m",
    },
  },
);

const postgresTranquilService = new ContainerService("postgres-tranquil", {
  image: "postgres",
  volumes: [
    {
      volumeName: "postgres-tranquil",
      containerPath: "/var/lib/postgresql",
    },
  ],
  envs: {
    POSTGRES_PASSWORD: getEnv("POSTGRES_PASSWORD"),
    POSTGRES_DB: "pds",
  },
});

const msmtprcFile = new asset.FileAsset(path.join(import.meta.dirname, "msmtprc"));
const copyMsmtprc = new remote.CopyToRemote("tranquil-msmtprc", {
  connection: defaultConnection,
  source: msmtprcFile,
  remotePath: "/home/bas/docker/tranquil/msmtprc",
});

const PDS_USER_HANDLE_DOMAINS = ["tranquil.bas.sh", "t.bas.sh", "on.bas.sh", "of.bas.sh"];
export const tranquilDnsRecords = PDS_USER_HANDLE_DOMAINS.flatMap((host) => [
  new DnsRecord(`tranquil-${host}`, {
    zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
    name: host,
    ttl: 1,
    type: "CNAME",
    content: "haring.bas.sh",
    proxied: false,
  }),
  new DnsRecord(`tranquil-wildcard-${host}`, {
    zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
    name: `*.${host}`,
    ttl: 1,
    type: "CNAME",
    content: "tranquil.bas.sh",
    proxied: false,
  }),
]);

export const tranquilService = new ContainerService(
  "tranquil",
  {
    localImage: tranquilImage.digest,
    servicePort: 3000,
    hostRule: "HostRegexp(`^(.+?\\.)?(t(ranquil)|o(n|f))\\.bas\\.sh`)",
    mounts: [
      confMount("tranquil/backups", "/var/lib/tranquil/backups"),
      confMount("tranquil/blobs", "/var/lib/tranquil/blobs"),
      mount(copyMsmtprc.remotePath, "/etc/msmtprc", { kind: "file" }),
    ],
    envs: {
      DATABASE_URL: interpolate`postgres://postgres:${getEnv("POSTGRES_PASSWORD")}@${postgresTranquilService.container.name}/pds`,
      PDS_HOSTNAME: "tranquil.bas.sh",
      BLOB_STORAGE_PATH: "/var/lib/tranquil/blobs",
      BACKUP_STORAGE_PATH: "/var/lib/tranquil/backups",
      JWT_SECRET: getEnv("TRANQUIL_JWT_SECRET"),
      DPOP_SECRET: getEnv("TRANQUIL_DPOP_SECRET"),
      MASTER_KEY: getEnv("TRANQUIL_MASTER_KEY"),
      MAIL_FROM_ADDRESS: "tranquil@bas.sh",
      MAIL_FROM_NAME: "Tranquil PDS",
      SMTP_PASSWORD: getEnv("SMTP_PASSWORD"),
      DISCORD_BOT_TOKEN: getEnv("TRANQUIL_DISCORD_BOT_TOKEN"),
      INVITE_CODE_REQUIRED: true,
      ACCEPTING_REPO_IMPORTS: true,
      PDS_USER_HANDLE_DOMAINS,
      CONTACT_EMAIL: getEnv("EMAIL"),
      PDS_AGE_ASSURANCE_OVERRIDE: true,
      CRAWLERS: fetchRelays(),
    },
    labels: {
      "traefik.http.middlewares.tranquil-redirect.redirectregex.regex":
        "^https://(t|on)\\.bas\\.sh/(.*)$",
      "traefik.http.middlewares.tranquil-redirect.redirectregex.replacement":
        "https://tranquil.bas.sh/${2}",
      "traefik.http.routers.tranquil-redirect.entrypoints": "https",
      "traefik.http.routers.tranquil-redirect.rule": "HostRegexp(`^(t|on)\\.bas\\.sh$`)",
      "traefik.http.routers.tranquil-redirect.middlewares": "cloudflare,tranquil-redirect",

      "traefik.http.middlewares.tranquil-user-redirect.redirectregex.regex":
        "^https://(.+\\.(t(ranquil)?|o(n|f))\\.bas\\.sh)/(.*)$",
      "traefik.http.middlewares.tranquil-user-redirect.redirectregex.replacement":
        "https://bsky.app/profile/${1}",
      "traefik.http.routers.tranquil-user-redirect.entrypoints": "https",
      "traefik.http.routers.tranquil-user-redirect.rule":
        "HostRegexp(`^.+\\.(t(ranquil)?|o(n|f))\\.bas\\.sh$`) && !PathPrefix(`/.well-known`)",
      "traefik.http.routers.tranquil-user-redirect.middlewares":
        "cloudflare,tranquil-user-redirect",
    },
  },
  { dependsOn: [...tranquilDnsRecords, copyMsmtprc] },
);
