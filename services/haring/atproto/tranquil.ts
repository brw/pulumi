import { asset, interpolate } from "@pulumi/pulumi";
import { getEnv } from "~lib/env";
import { _mount, confMount, mount } from "~lib/service/mounts";
import { ContainerService, defaultConnection } from "~lib/service/service";
import dockerBuild from "@pulumi/docker-build";
import { remote } from "@pulumi/command";
import { getLatestCommit } from "~lib/service/util";
import { PDS_CRAWLERS } from "./pds";

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
  },
  {
    replacementTrigger: await getLatestCommit(
      "https://tangled.org/tranquil.farm/tranquil-pds/commits/main",
    ),
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

let tranquilService: ContainerService | undefined;

if (postgresTranquilService.container) {
  const msmtprcFile = new asset.FileAsset(`${import.meta.dirname}/tranquil-files/msmtprc`);
  const copyMsmtprc = new remote.CopyToRemote("tranquil-msmtprc", {
    connection: defaultConnection,
    source: msmtprcFile,
    remotePath: "/home/bas/docker/tranquil/msmtprc",
  });

  tranquilService = new ContainerService("tranquil", {
    localImage: tranquilImage.digest,
    servicePort: 3000,
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
      DISCORD_BOT_TOKEN: getEnv("TRANQUIL_DISCORD_BOT_TOKEN"),
      INVITE_CODE_REQUIRED: true,
      ACCEPTING_REPO_IMPORTS: true,
      PDS_USER_HANDLE_DOMAINS: ["tranquil.bas.sh", "t.bas.sh", "on.bas.sh"],
      CONTACT_EMAIL: getEnv("EMAIL"),
      PDS_AGE_ASSURANCE_OVERRIDE: true,
      CRAWLERS: PDS_CRAWLERS,
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
        "^https://(.+\\.(t(ranquil)?|on)\\.bas\\.sh)/(.*)$",
      "traefik.http.middlewares.tranquil-user-redirect.redirectregex.replacement":
        "https://bsky.app/profile/${1}",
      "traefik.http.routers.tranquil-user-redirect.entrypoints": "https",
      "traefik.http.routers.tranquil-user-redirect.rule":
        "HostRegexp(`^.+\\.(t(ranquil)?|on)\\.bas\\.sh$`)",
      "traefik.http.routers.tranquil-user-redirect.middlewares":
        "cloudflare,tranquil-user-redirect",

      "traefik.http.middlewares.tranquil-favicon.redirectregex.regex":
        "^https://tranquil\\.bas\\.sh/favicon\\.ico$",
      "traefik.http.middlewares.tranquil-favicon.redirectregex.replacement":
        "https://tranquil.bas.sh/logo",
      "traefik.http.routers.tranquil-favicon.entrypoints": "https",
      "traefik.http.routers.tranquil-favicon.rule":
        "Host(`tranquil.bas.sh`) && Path(`/favicon.ico`)",
      "traefik.http.routers.tranquil-favicon.middlewares": "cloudflare,tranquil-favicon",

      // "traefik.http.middlewares.tranquil-favicon-witchsky.redirectregex.regex":
      //   "^https://tranquil\\.bas\\.sh/favicon\\.ico$",
      // "traefik.http.middlewares.tranquil-favicon-witchsky.redirectregex.replacement":
      //   "https://wsrv.nl/?url=https://tranquil.bas.sh/logo&w=564&h=564&fit=contain&bg=white&we",
      // "traefik.http.routers.tranquil-favicon-witchsky.entrypoints": "https",
      // "traefik.http.routers.tranquil-favicon-witchsky.rule":
      //   "Host(`tranquil.bas.sh`) && Path(`/favicon.ico`)",
      // "Host(`tranquil.bas.sh`) && Path(`/favicon.ico`) && HeaderRegexp(`Referer`, `\\bwitchsky\\b`)",
      // "traefik.http.routers.tranquil-favicon-witchsky.middlewares":
      //   "cloudflare,tranquil-favicon-witchsky",
    },
  });
}

export { tranquilService };
