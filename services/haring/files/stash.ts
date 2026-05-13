import { ContainerService } from "~lib/service";
import { confMount, ssdcacheMount, gitMount, mount } from "~lib/service/mounts";

export const stashService = new ContainerService("stash", {
  image: "stashapp/stash",
  servicePort: 9999,
  mounts: [
    confMount("stash", "/root/.stash"),
    ssdcacheMount("", "/data"),
    gitMount(),
    mount("/etc/localtime", "/etc/localtime", { readOnly: true }),
  ],
  cpuShares: 128,
});
