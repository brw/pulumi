import { DnsRecord } from "@pulumi/cloudflare";
import { getEnv } from "~lib/env";
import { fetchRelays } from "~lib/relay-hosts";
import { ContainerService } from "~lib/service";
import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { toHostRule } from "~lib/util";

const SUBDOMAINS = ["pegasus"];
const HANDLE_DOMAINS = SUBDOMAINS.map((subdomain) => `${subdomain}.bas.sh`);
const WILDCARD_HOSTS = HANDLE_DOMAINS.map((domain) => `*.${domain}`);

export const pegasusService = new ContainerService("pegasus", {
  image: "ghcr.io/futurgh/pegasus",
  servicePort: 8008,
  hostRule: toHostRule([...HANDLE_DOMAINS, ...WILDCARD_HOSTS]),
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
    "traefik.http.routers.pegasus-user-redirect.entrypoints": "https",
    "traefik.http.routers.pegasus-user-redirect.rule": `(${toHostRule(WILDCARD_HOSTS)}) && !PathPrefix(\`/.well-known\`)`,
    "traefik.http.routers.pegasus-user-redirect.middlewares": "cloudflare,bsky-user-redirect",
    "traefik.http.routers.pegasus-user-redirect.priority": 1000,

    "traefik.http.middlewares.pegasus-favicon.redirectregex.regex": "^https://.+/favicon\\.ico$",
    "traefik.http.middlewares.pegasus-favicon.redirectregex.replacement":
      "https://wsrv.nl/?url=https://em-content.zobj.net/source/serenityos/392/horse-face_1f434.png&w=74&h=74&fit=contain&bg=ece5d3&we",
    "traefik.http.routers.pegasus-favicon.entrypoints": "https",
    "traefik.http.routers.pegasus-favicon.rule": `(${toHostRule(HANDLE_DOMAINS)}) && Path(\`/favicon.ico\`)`,
    "traefik.http.routers.pegasus-favicon.middlewares": "cloudflare,pegasus-favicon",
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
  :80 {
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
  hostRulePriority: 10000,
  command: ["/bin/sh", "-c", `echo '${CADDYFILE}' | caddy run --config - --adapter caddyfile`],
  mounts: [ssdcacheMount("web/horse", "/var/www")],
  workingDir: "/var/www",
});
