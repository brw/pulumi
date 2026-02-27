import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const redroidService = new ContainerService("redroid", {
  enabled: false, // seems to break my entire server's networking setup somehow?
  image: "redroid/redroid:12.0.0_64only-latest",
  privileged: true,
  ports: ["100.93.167.100:5555:5555"],
  mounts: [confMount("redroid", "/data"), ssdcacheMount("redroid", "/storage/emulated/0/NAS")],
  command: [
    "androidboot.redroid_width=1080",
    "androidboot.redroid_height=1920",
    "androidboot.redroid_dpi=480",
    "androidboot.use_memfd=true",
    "ro.secure=0",
  ],
  networkMode: "bridge",
});
