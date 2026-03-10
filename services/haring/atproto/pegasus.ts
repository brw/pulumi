import { DnsRecord } from "@pulumi/cloudflare";
import { getEnv } from "~lib/env";
import { fetchRelays } from "~lib/relay-hosts";
import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const pegasusService = new ContainerService("pegasus", {
  image: "ghcr.io/futurgh/pegasus",
  servicePort: 8008,
  hostRule: "HostRegexp(`^(.+?\\.)?pegasus\\.bas\\.sh`)",
  mounts: [confMount("pegasus", "/data")],
  envs: {
    PSD_LOG_LEVEL: "info",
    PDS_HOSTNAME: "pegasus.bas.sh",
    PDS_ADMIN_PASSWORD: getEnv("PEGASUS_ADMIN_PASSWORD"),
    PDS_SMTP_AUTH_URI: getEnv("PDS_SMTP_AUTH_URI"),
    PDS_SMTP_SENDER: "Pegasus PDS <pegasus@bas.sh>",
    PDS_ROTATION_KEY_MULTIBASE: getEnv("PEGASUS_ROTATION_KEY_MULTIBASE"),
    PDS_JWK_MULTIBASE: getEnv("PEGASUS_JWK_MULTIBASE"),
    PDS_DPOP_NONCE_SECRET: getEnv("PEGASUS_DPOP_NONCE_SECRET"),
    PDS_CRAWLERS: fetchRelays(),
  },
  labels: {
    "traefik.http.middlewares.pegasus-user-redirect.redirectregex.regex":
      "^https://(.+\\.pegasus\\.bas\\.sh)/(.*)$",
    "traefik.http.middlewares.pegasus-user-redirect.redirectregex.replacement":
      "https://bsky.app/profile/${1}",
    "traefik.http.routers.pegasus-user-redirect.entrypoints": "https",
    "traefik.http.routers.pegasus-user-redirect.rule":
      "HostRegexp(`^.+\\.pegasus\\.bas\\.sh$`) && !PathPrefix(`/.well-known`)",
    "traefik.http.routers.pegasus-user-redirect.middlewares": "cloudflare,pegasus-user-redirect",
    "traefik.http.routers.pegasus-user-redirect.priority": 100,

    "traefik.http.middlewares.pegasus-favicon-witchsky.redirectregex.regex":
      "^https://pegasus\\.bas\\.sh/favicon\\.ico$",
    "traefik.http.middlewares.pegasus-favicon-witchsky.redirectregex.replacement":
      "https://wsrv.nl/?url=https://em-content.zobj.net/source/serenityos/392/horse-face_1f434.png&w=74&h=74&fit=contain&bg=ece5d3&we",
    "traefik.http.routers.pegasus-favicon-witchsky.entrypoints": "https",
    "traefik.http.routers.pegasus-favicon-witchsky.rule":
      "Host(`pegasus.bas.sh`) && Path(`/favicon.ico`)",
    // "Host(`pegasus.bas.sh`) && Path(`/favicon.ico`) && HeaderRegexp(`Referer`, `\\bwitchsky\\b`)",
    "traefik.http.routers.pegasus-favicon-witchsky.middlewares":
      "cloudflare,pegasus-favicon-witchsky",
  },
});

export const pegasusDnsRecord = new DnsRecord("pegasus", {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: "pegasus.bas.sh",
  ttl: 1,
  type: "CNAME",
  content: "haring.bas.sh",
  proxied: false,
});

export const pegasusWildcardDnsRecord = new DnsRecord("pegasus-wildcard", {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: "*.pegasus.bas.sh",
  ttl: 1,
  type: "CNAME",
  content: "pegasus.bas.sh",
  proxied: false,
});

const CADDYFILE = `
  http://horse.pegasus.bas.sh:80 {
    respond <<HORSE

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠨⣧⡀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⢦⣀⡀⠀⠙⢶⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣄⠀⠀⠀⠀⠀⠈⠳⣮⡙⠲⠀⠀⢱⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣷⡄⠀⠀⠀⢀⡀⠀⠙⠳⣤⠀⠀⣧⠀⠀⣀⣼⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⣇⣻⣯⠷⠟⠋⠉⠉⠻⣆⠀⠈⣧⢀⡇⣀⣾⡿⢿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠓⣦⣤⣀⡀⠀⢀⣀⣠⣤⡾⠟⠛⠁⠀⠀⠀⠀⠀⠀⠀⠘⣇⠀⡿⢨⣼⠟⠁⠀⢸⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡄⠀⠀⠀⠀⠀⠙⠻⠭⣉⣉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⢘⡶⠋⠀⠀⠀⠀⣾⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣦⡀⠀⠀⠀⠀⠀⠀⣀⣩⣤⠤⠴⠒⠒⠂⠀⠀⠀⠀⢀⣀⠀⠀⠀⢸⡟⠀⠀⠀⠀⠀⣼⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢟⠳⠦⠴⠖⠛⠋⠉⠀⠀⠀⠀⣀⣠⠴⠖⠛⠋⠉⠉⠀⠀⢀⣠⢯⠇⠀⠀⠀⢠⠔⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠲⠤⠀⠀⠀⠀⣀⣤⠶⠛⠉⠀⠀⠀⠀⠀⢀⣠⡤⠖⠋⠁⠘⠀⠀⠀⠀⠸⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⣄⣀⣀⣀⣀⣀⣤⣤⡶⠟⠋⠁⠀⠀⠀⠀⢀⣤⠶⠛⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠿⢏⣉⣉⣉⣁⠀⠀⠀⠀⠀⡀⢀⣴⣯⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢤⣤⣤⣤⣤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇⣼⠃⢿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⣿⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠉⠛⢯⡙⠷⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢳⣏⠀⣈⠛⠙⠀⠀⢠⠀⠀⠀⠀⠀⠀⡆⠀⠸⠛⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢦⠈⠙⠷⣤⡀⠀⠀⠀⠀⠀⠀⡀⠬⢿⡀⡟⡀⠀⠀⠀⢸⡄⠀⠀⠀⠀⢠⡇⠀⠀⠈⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠓⠶⠶⠶⠒⠉⠀⠀⣠⠟⠁⡇⠀⠀⠀⠘⡇⠀⠀⠀⠀⢸⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣄⣠⣀⣀⣀⣠⣤⣤⣤⡾⠋⠁⠀⠀⡇⠀⠀⠀⠠⢳⠀⠀⠀⢠⡟⠀⠀⠀⢠⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣠⣴⠿⠟⠛⠛⠛⠛⠛⠛⠛⠛⠛⠋⢉⡄⠀⠀⠀⠀⡶⠹⡄⠀⠀⠀⠸⠀⠀⠀⠀⠿⠀⠀⢀⡿⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢀⣼⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⠴⠊⠀⠀⠀⠀⠀⡇⠀⢹⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡞⠀⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣸⠃⠀⠀⠀⠀⢀⣀⣠⡤⠤⠖⠛⠉⠁⠀⠀⠀⠀⣴⠀⠀⡇⠀⠀⢣⠀⠀⠀⠀⠀⠀⠀⠀⠀⡞⠀⠀⣸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢠⡇⠀⠀⢀⣴⠾⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⠃⠀⢸⠇⠀⠀⢸⢰⡆⠀⠀⠀⠀⠀⢰⡄⠁⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠚⠀⠀⢠⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⠁⠀⠀⣸⠀⠀⠀⢸⣿⣷⡀⠀⠀⠀⣠⣿⣷⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣾⠃⢀⣠⠴⠶⠖⠒⠒⠊⠁⠀⣠⣾⠏⠁⠀⠀⢠⡏⠀⠀⠀⢘⣿⣿⡿⠀⠀⠀⢿⣿⠿⡆⠀⠀⣿⣀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢰⣿⣴⠏⠁⠀⠀⠀⠀⠀⢀⣴⣿⠟⠁⠀⠀⢀⡎⢸⠇⠀⠀⠀⠸⣄⠈⠀⠀⠀⠀⠀⠀⣰⠇⠀⠀⣿⡀⠀⠀⠈⠙⠛⠶⣤⣄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢰⣿⡟⠀⠀⠀⠀⠀⢀⣴⡿⠋⠁⠀⠀⠀⢠⠟⠀⡞⠀⠀⠀⠀⠀⠙⢦⣄⡤⠀⢠⣴⡶⠋⠀⠀⠀⣿⢷⡀⠀⠀⠀⠀⠀⠀⠉⠻⣦⡀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢹⠂⠀⠀⠀⠀⢰⣿⠟⠀⠀⠀⠀⢀⡴⠋⠀⢰⡇⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠉⠉⠀⠀⠀⠀⠀⣿⠈⢷⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣦⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢸⡀⠀⠀⠀⢠⣿⠇⠀⠀⠀⠀⡼⠋⠀⠀⠀⢸⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠘⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣆⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⠁⠀⠀⠀⣸⣿⠀⠀⡴⠁⢸⠁⠀⠀⠀⠀⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⢻⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⡄⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⢿⣇⢀⡃⠀⠘⠀⠀⠀⠀⠀⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡟⠀⠀⠈⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣦⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡄
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⣞⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣻⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢃
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸
HORSE 200
  }
`;

export const horseService = new ContainerService(`caddy-horse`, {
  image: "caddy",
  servicePort: 80,
  hostRule: "Host(`horse.pegasus.bas.sh`) && Path(`/`)",
  hostRulePriority: 1000,
  command: ["/bin/sh", "-c", `echo '${CADDYFILE}' | caddy run --config - --adapter caddyfile`],
  mounts: [ssdcacheMount("web/horse", "/var/www")],
  workingDir: "/var/www",
});
