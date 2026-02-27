import { confMount, ssdcacheMount, gitMount, mount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const stashService = new ContainerService("stash", {
  image: "stashapp/stash",
  servicePort: 9999,
  mounts: [
    confMount("stash", "/root/.stash"),
    ssdcacheMount("", "/data"),
    gitMount(),
    mount("/etc/localtime", "/etc/localtime", { readOnly: true }),
  ],
  middlewares: ["auth"],
  cpuShares: 128,
});
