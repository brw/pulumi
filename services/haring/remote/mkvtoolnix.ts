import { getEnv } from "~lib/env";
import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const mkvtoolnixService = new ContainerService("mkvtoolnix", {
  image: "jlesage/mkvtoolnix",
  servicePort: 5800,
  mounts: [confMount("mkvtoolnix"), ssdcacheMount()],
  envs: {
    VNC_PASSWORD: getEnv("VNC_PASSWORD"),
    DARK_MODE: true,
    APP_NICENESS: 10,
    KEEP_APP_RUNNING: 1,
    ENABLE_CJK_FONT: 1,
  },
});
