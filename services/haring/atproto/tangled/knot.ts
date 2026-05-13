import { DnsRecord } from "@pulumi/cloudflare";
import { Image } from "@pulumi/docker-build";
import { getEnv } from "~lib/env";
import { ContainerService } from "~lib/service";
import { confMount, nvmeMount } from "~lib/service/mounts";
import { getLatestTangledCommit } from "~lib/util";

const knotImage = new Image(
  "knot",
  {
    tags: ["knot:latest"],
    context: {
      // location: "https://tangled.org/tangled.org/knot-docker.git",
      location: "https://tangled.org/bas.sh/knot-docker.git#fork",
    },
    target: "knot",
    buildArgs: {
      BUILDKIT_CONTEXT_KEEP_GIT_DIR: "true",
    },
    exports: [{ docker: {} }],
    push: false,
    buildOnPreview: false,
  },
  {
    replacementTrigger: await getLatestTangledCommit(
      "https://tangled.org/bas.sh/knot-docker/commits/fork",
    ),
  },
);

const KNOT_GIT_MOTD = `         ／人◕ ‿‿ ◕人＼
  \x1B[2mYour contract has been made.\x1B[22m\n`;

export const knotService = new ContainerService("knot", {
  localImage: knotImage.digest,
  servicePort: 5555,
  ports: [22],
  mounts: [confMount("knot", "/app"), nvmeMount("knot", "/home/git/repositories")],
  volumes: [{ volumeName: "knot-keys", containerPath: "/etc/ssh/keys" }],
  envs: {
    KNOT_SERVER_HOSTNAME: "knot.bas.sh",
    KNOT_SERVER_OWNER: getEnv("ATPROTO_DID"),
    KNOT_SERVER_DB_PATH: "/app/knotserver.db",
    KNOT_SERVER_INTERNAL_LISTEN_ADDR: "localhost:5444",
  },
  uploads: [{ content: KNOT_GIT_MOTD, file: "/home/git/motd" }],
});

const KNOT_WEB_MOTD = `
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

This is a knot server. More info at https://docs.tangled.org/knot-self-hosting-guide

Most API routes are under /xrpc/
`.slice(1);

const CADDYFILE = `
  :80 {
    respond "${KNOT_WEB_MOTD}" 200
  }
`;

export const knotCaddyService = new ContainerService("knot-web", {
  image: "caddy",
  servicePort: 80,
  hostRule: "Host(`knot.bas.sh`) && Path(`/`)",
  hostRulePriority: 1000,
  command: ["/bin/sh", "-c", `echo '${CADDYFILE}' | caddy run --config - --adapter caddyfile`],
  middlewares: ["cors"],
  labels: {
    "traefik.http.middlewares.knot-favicon.redirectregex.regex":
      "^https://knot\\.bas\\.sh/favicon\\.ico$",
    "traefik.http.middlewares.knot-favicon.redirectregex.replacement":
      "https://tranquil.bas.sh/favicon.ico",
    "traefik.http.routers.knot-favicon.entrypoints": "https",
    "traefik.http.routers.knot-favicon.rule": "Host(`knot.bas.sh`) && Path(`/favicon.ico`)",
    "traefik.http.routers.knot-favicon.middlewares": "cloudflare,knot-favicon",
  },
});

export const knotDnsRecord = new DnsRecord("knot", {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: "knot",
  ttl: 1,
  type: "CNAME",
  content: "haring.bas.sh",
  proxied: false,
});
