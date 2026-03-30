import { ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

const CADDYFILE = `
  :80 {}
`;

export const caddyFileserverService = new ContainerService(`caddy-dani`, {
  image: "caddy",
  servicePort: 80,
  subdomain: "dani",
  command: ["/bin/sh", "-c", `echo '${CADDYFILE}' | caddy run --config - --adapter caddyfile`],
  mounts: [ssdcacheMount("web/dani", "/var/www")],
  workingDir: "/var/www",
});
