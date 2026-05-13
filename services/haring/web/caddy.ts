import { getEnv } from "~lib/env";
import { ContainerService } from "~lib/service";
import { ssdcacheMount } from "~lib/service/mounts";

const SUBDOMAINS = ["get", "static", "files", "f", "i"];

const CADDYFILE = `
  :80 {
    file_server browse {
    }
    header X-Robots-Tag "noindex"
    basic_auth /plex/* {
      ${getEnv("CADDY_USERNAME_1")} ${getEnv("CADDY_PASSWORD_1")}
      ${getEnv("CADDY_USERNAME_2")} ${getEnv("CADDY_PASSWORD_2")}
      ${getEnv("CADDY_USERNAME_3")} ${getEnv("CADDY_PASSWORD_3")}
    }
  }
`;

export const caddyFileserverService = new ContainerService("caddy-fileserver", {
  image: "caddy",
  servicePort: 80,
  hostRule: SUBDOMAINS.map((sub) => `Host(\`${sub}.bas.sh\`)`).join(" || "),
  command: ["/bin/sh", "-c", `echo '${CADDYFILE}' | caddy run --config - --adapter caddyfile`],
  mounts: [ssdcacheMount("web/files", "/var/www"), ssdcacheMount()],
  workingDir: "/var/www",
});
