import { confMount, dataMount, nvmeMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const qbittorrentService = new ContainerService("qbittorrent", {
  image: "lscr.io/linuxserver/qbittorrent:5.1.4",
  servicePort: 8080,
  // ports: [1337, "1337/udp"],
  envs: {
    // TORRENTING_PORT: 1337,
    DOCKER_MODS: "ghcr.io/vuetorrent/vuetorrent-lsio-mod:latest",
  },
  mounts: [confMount("qbittorrent"), dataMount(), nvmeMount()],
  networkMode: "host",
});
