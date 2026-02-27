import { getEnv } from "~lib/env";
import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const czkawkaService = new ContainerService("czkawka", {
  image: "jlesage/czkawka",
  servicePort: 5800,
  mounts: [confMount("czkawka"), ssdcacheMount("", "/storage")],
  envs: {
    USER_ID: getEnv("PGID"),
    GROUP_ID: getEnv("PUID"),
    DARK_MODE: 1,
    WEB_AUDIO: 1,
    WEB_FILE_MANAGER: 1,
    ENABLE_CJK_FONT: 1,
    APP_NICENESS: 15,
  },
  middlewares: ["auth"],
});
