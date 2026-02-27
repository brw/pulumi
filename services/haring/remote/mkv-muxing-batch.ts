import { getEnv } from "~lib/env";
import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const mkvMuxingBatchService = new ContainerService("mkv-batch", {
  image: "jlesage/mkv-muxing-batch-gui",
  servicePort: 5800,
  subdomain: "mkv-batch",
  mounts: [confMount("mkv-batch"), ssdcacheMount()],
  envs: {
    VNC_PASSWORD: getEnv("VNC_PASSWORD"),
    DARK_MODE: true,
    APP_NICENESS: 10,
    KEEP_APP_RUNNING: 1,
    ENABLE_CJK_FONT: 1,
  },
});
