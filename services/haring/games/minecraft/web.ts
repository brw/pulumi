import { ContainerService } from "~lib/service";
import { ssdcacheMount } from "~lib/service/mounts";

const mcWebService = new ContainerService("mc-web", {
  image: "caddy",
  servicePort: 80,
  subdomain: "mc",
  mounts: [ssdcacheMount("web/mc", "/var/www")],
  command: ["caddy", "file-server", "--root=/var/www", "--domain=mc.bas.sh", "--listen=:80"],
});
