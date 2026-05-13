import { ContainerService } from "~lib/service";
import { mount } from "~lib/service/mounts";

export const hytaleService = new ContainerService("hytale", {
  image: "hybrowse/hytale-server",
  ports: ["5520/udp"],
  mounts: [mount("/mnt/nvme1/hytale", "/data")],
  envs: {
    HYTALE_AUTO_DOWNLOAD: true,
  },
  tty: true,
  stdinOpen: true,
});
