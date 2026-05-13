import { DnsRecord } from "@pulumi/cloudflare";
import { Image } from "@pulumi/docker-build";
import { getEnv } from "~lib/env";
import { ContainerService } from "~lib/service";
import { confMount, dockerSocket, nvmeMount } from "~lib/service/mounts";
import { getLatestTangledCommit } from "~lib/util";

const spindleImage = new Image(
  "spindle",
  {
    tags: ["spindle:latest"],
    context: {
      // location: "https://tangled.org/tangled.org/knot-docker.git",
      location: "https://tangled.org/bas.sh/knot-docker.git#fork",
    },
    target: "spindle",
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

export const spindleService = new ContainerService("spindle", {
  localImage: spindleImage.digest,
  servicePort: 6555,
  mounts: [
    confMount("spindle/logs", "/var/log/spindle"),
    nvmeMount("spindle/app", "/app"),
    nvmeMount("spindle/images", "/images"),
    nvmeMount("spindle/overlays", "/overlays"),
    dockerSocket,
  ],
  devices: ["/dev/kvm", "/dev/vhost-vsock", "/dev/vsock", "/dev/net/tun"].map((dev) => ({
    containerPath: dev,
    hostPath: dev,
    permissions: "r",
  })),
  envs: {
    SPINDLE_SERVER_HOSTNAME: "spindle.bas.sh",
    SPINDLE_SERVER_OWNER: getEnv("ATPROTO_DID"),
    SPINDLE_PIPELINES_WORKFLOW_TIMEOUT: "60m",
    SPINDLE_MICROVM_PIPELINES_WORKFLOW_TIMEOUT: "60m",
    SPINDLE_MICROVM_PIPELINES_IMAGE_DIR: "/images",
    SPINDLE_MICROVM_PIPELINES_OVERLAY_DIR: "/overlays",
    SPINDLE_NIX_CACHE_READ_URLS: "http://ncps:8501,https://cache.nixos.org",
    SPINDLE_NIX_CACHE_TRUSTED_PUBLIC_KEYS:
      "cache.bas.sh:HR5UV8Png8fmmG1vCPHmNHyV+lwZPjP3Sk/BjxfGOFk=,cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY=",
    SPINDLE_NIX_CACHE_UPLOAD_URL: "http://ncps:8501",
  },
  capabilities: ["NET_ADMIN", "SYS_ADMIN"],
  securityOpts: ["apparmor=unconfined", "seccomp=unconfined", "label=disable"],
  privileged: true, // TODO: remove
});

const SPINDLE_MOTD = `
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

This is a spindle server. More info at https://docs.tangled.org/spindles#spindles

Most API routes are under /xrpc/
`.slice(1);

const CADDYFILE = `
  :80 {
    respond "${SPINDLE_MOTD}" 200
  }
`;

export const spindleCaddyService = new ContainerService("spindle-web", {
  image: "caddy",
  servicePort: 80,
  hostRule: "Host(`spindle.bas.sh`) && Path(`/`)",
  hostRulePriority: 1000,
  command: ["/bin/sh", "-c", `echo '${CADDYFILE}' | caddy run --config - --adapter caddyfile`],
  middlewares: ["cors"],
  labels: {
    "traefik.http.middlewares.spindle-favicon.redirectregex.regex":
      "^https://spindle\\.bas\\.sh/favicon\\.ico$",
    "traefik.http.middlewares.spindle-favicon.redirectregex.replacement":
      "https://tranquil.bas.sh/favicon.ico",
    "traefik.http.routers.spindle-favicon.entrypoints": "https",
    "traefik.http.routers.spindle-favicon.rule": "Host(`spindle.bas.sh`) && Path(`/favicon.ico`)",
    "traefik.http.routers.spindle-favicon.middlewares": "cloudflare,spindle-favicon",
  },
});

export const spindleDnsRecord = new DnsRecord("spindle", {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: "spindle",
  ttl: 1,
  type: "CNAME",
  content: "haring.bas.sh",
  proxied: false,
});
