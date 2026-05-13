import { ContainerService } from "~lib/service";
import { confMount } from "~lib/service/mounts";

export const theloungeService = new ContainerService("thelounge", {
  servicePort: 9000,
  subdomain: "irc",
  mounts: [confMount("thelounge")],
});
