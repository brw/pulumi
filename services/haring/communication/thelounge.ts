import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const theloungeService = new ContainerService("thelounge", {
  servicePort: 9000,
  subdomain: "irc",
  mounts: [confMount("thelounge")],
});
