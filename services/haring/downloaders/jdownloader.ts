import { getEnv } from "~lib/env";
import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const jdownloaderService = new ContainerService("jdownloader", {
  image: "jlesage/jdownloader-2",
  servicePort: 5800,
  ports: [3129, 5800],
  mounts: [confMount("jdownloader"), ssdcacheMount("downloads", "/output")],
  envs: {
    KEEP_APP_RUNNING: 1,
    DARK_MODE: 1,
    WEB_AUDIO: 1,
    ENABLE_CJK_FONT: 1,
    MYJDOWNLOADER_EMAIL: getEnv("EMAIL"),
    MYJDOWNLOADER_PASSWORD: getEnv("JDOWNLOADER_PASSWORD"),
    MYJDOWNLOADER_DEVICE_NAME: "Haring",
  },
  middlewares: ["auth"],
});
