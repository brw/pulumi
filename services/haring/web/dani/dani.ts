import { ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

const CADDYFILE = `
  danimutiara.nl:80 {}
`;

export const caddyFileserverService = new ContainerService(`caddy-dani`, {
  image: "caddy",
  servicePort: 80,
  subdomain: "dani",
  command: ["/bin/sh", "-c", `echo '${CADDYFILE}' | caddy run --config - --adapter caddyfile`],
  mounts: [ssdcacheMount("web/dani", "/var/www"), ssdcacheMount()],
  workingDir: "/var/www",
});
