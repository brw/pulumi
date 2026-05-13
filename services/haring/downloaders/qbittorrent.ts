import { ContainerService } from "~lib/service";
import { confMount, dataMount, nvmeMount } from "~lib/service/mounts";

export const qbittorrentService = new ContainerService("qbittorrent", {
  image: "lscr.io/linuxserver/qbittorrent:5.2.3",
  servicePort: 8080,
  // ports: [1337, "1337/udp"],
  envs: {
    // TORRENTING_PORT: 1337,
    DOCKER_MODS: "ghcr.io/vuetorrent/vuetorrent-lsio-mod:latest",
  },
  mounts: [confMount("qbittorrent"), dataMount(), nvmeMount()],
  networkMode: "host",
});
