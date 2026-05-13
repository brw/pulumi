import { DnsRecord } from "@pulumi/cloudflare";
import { Image } from "@pulumi/docker-build";
import { interpolate } from "@pulumi/pulumi";
import { getEnv } from "~lib/env";
import { fetchRelays } from "~lib/relay-hosts";
import { ContainerService } from "~lib/service";
import { confMount } from "~lib/service/mounts";
import { getLatestTangledCommit, toHostRule } from "~lib/util";

const tranquilImage = new Image(
  "tranquil-pds",
  {
    tags: ["tranquil-pds:latest"],
    context: {
      location: "https://tangled.org/tranquil.farm/tranquil-pds.git",
    },
    // platforms: [
    //   dockerBuild.Platform.Linux_amd64,
    //   dockerBuild.Platform.Linux_arm64,
    //   dockerBuild.Platform.Darwin_amd64,
    //   dockerBuild.Platform.Darwin_arm64,
    // ],
    buildArgs: {
      BUILDKIT_CONTEXT_KEEP_GIT_DIR: "true",
    },
    exports: [{ docker: {} }],
    push: false,
    buildOnPreview: false,
  },
  {
    replacementTrigger: await getLatestTangledCommit(
      "https://tangled.org/tranquil.farm/tranquil-pds/commits/main",
    ),
    customTimeouts: {
      create: "60m",
      update: "60m",
    },
  },
);

const postgresTranquilService = new ContainerService("postgres-tranquil", {
  image: "postgres",
  mounts: [confMount("postgres-tranquil", "/var/lib/postgresql")],
  envs: {
    POSTGRES_PASSWORD: getEnv("POSTGRES_PASSWORD"),
    POSTGRES_DB: "pds",
  },
});

const SUBDOMAINS = ["tranquil", "t", "on", "of"];
const HANDLE_DOMAINS = SUBDOMAINS.map((subdomain) => `${subdomain}.bas.sh`);
const WILDCARD_HOSTS = HANDLE_DOMAINS.map((domain) => `*.${domain}`);

for (const host of [...HANDLE_DOMAINS, ...WILDCARD_HOSTS]) {
  new DnsRecord(
    `tranquil-${host}`,
    {
      zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
      name: host,
      ttl: 1,
      type: "CNAME",
      content: "haring.bas.sh",
      proxied: false,
    },
    {
      aliases: [
        {
          name: host.includes("*")
            ? `tranquil-${host.replace("*.", "wildcard-")}`
            : `tranquil-${host}`,
        },
      ],
    },
  );
}

export const tranquilService = new ContainerService("tranquil", {
  localImage: tranquilImage.digest,
  servicePort: 3000,
  hostRule: `Host(\`tranquil.bas.sh\`) || ((${toHostRule(WILDCARD_HOSTS)}) && PathPrefix(\`/.well-known\`))`,
  mounts: [confMount("tranquil/blobs", "/var/lib/tranquil/blobs")],
  envs: {
    DATABASE_URL: interpolate`postgres://postgres:${getEnv("POSTGRES_PASSWORD")}@${postgresTranquilService.container.name}/pds`,
    PDS_HOSTNAME: "tranquil.bas.sh",
    BLOB_STORAGE_PATH: "/var/lib/tranquil/blobs",
    JWT_SECRET: getEnv("TRANQUIL_JWT_SECRET"),
    DPOP_SECRET: getEnv("TRANQUIL_DPOP_SECRET"),
    MASTER_KEY: getEnv("TRANQUIL_MASTER_KEY"),
    MAIL_FROM_ADDRESS: "tranquil@bas.sh",
    MAIL_FROM_NAME: "Tranquil PDS - Bas",
    MAIL_SMARTHOST_HOST: "smtp.migadu.com",
    MAIL_SMARTHOST_PORT: 465,
    MAIL_SMARTHOST_USERNAME: "hi@bas.sh",
    MAIL_SMARTHOST_PASSWORD: getEnv("SMTP_PASSWORD"),
    MAIL_SMARTHOST_TLS: "implicit",
    DISCORD_BOT_TOKEN: getEnv("TRANQUIL_DISCORD_BOT_TOKEN"),
    INVITE_CODE_REQUIRED: true,
    ACCEPTING_REPO_IMPORTS: true,
    PDS_USER_HANDLE_DOMAINS: HANDLE_DOMAINS,
    CONTACT_EMAIL: getEnv("EMAIL"),
    PDS_AGE_ASSURANCE_OVERRIDE: true,
    CRAWLERS: fetchRelays(),
  },
  labels: {
    "traefik.http.middlewares.tranquil-main-redirect.redirectregex.regex": `^.+?\\.bas.sh/(.*)?$`,
    "traefik.http.middlewares.tranquil-main-redirect.redirectregex.replacement":
      "https://tranquil.bas.sh/${1}",
    "traefik.http.routers.tranquil-main-redirect.entrypoints": "https",
    "traefik.http.routers.tranquil-main-redirect.rule": toHostRule(HANDLE_DOMAINS.slice(1)),
    "traefik.http.routers.tranquil-main-redirect.middlewares": "cloudflare,tranquil-main-redirect",
    "traefik.http.routers.tranquil-main-redirect.priority": 1000,

    "traefik.http.routers.tranquil-user-redirect.entrypoints": "https",
    "traefik.http.routers.tranquil-user-redirect.rule": `(${toHostRule(WILDCARD_HOSTS)}) && !PathPrefix(\`/.well-known\`)`,
    "traefik.http.routers.tranquil-user-redirect.middlewares": "cloudflare,bsky-user-redirect",
    "traefik.http.routers.tranquil-user-redirect.priority": 1000,
  },
});
