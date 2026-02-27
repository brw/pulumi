import { getEnv } from "~lib/env";
import { ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

const SUBDOMAINS = ["get", "static", "files", "f", "i"];

const CADDYFILE = `
  ${SUBDOMAINS.map((sub) => `http://${sub}.bas.sh:80`).join(" ")} {
    file_server browse {
    }
    header X-Robots-Tag "noindex"
    basic_auth /plex/* {
      ${getEnv("CADDY_USERNAME")} ${Buffer.from(getEnv("CADDY_PASSWORD")).toString("base64")}
    }
  }
`;

export const caddyFileserverService = new ContainerService(`caddy-fileserver`, {
  image: "caddy",
  servicePort: 80,
  hostRule: SUBDOMAINS.map((sub) => `Host(\`${sub}.bas.sh\`)`).join(" || "),
  command: ["/bin/sh", "-c", `echo '${CADDYFILE}' | caddy run --config - --adapter caddyfile`],
  mounts: [ssdcacheMount("web/files", "/var/www"), ssdcacheMount()],
  workingDir: "/var/www",
});
