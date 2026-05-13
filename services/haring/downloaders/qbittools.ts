import { getEnv } from "~lib/env";
import { ContainerService } from "~lib/service";
import { confMount } from "~lib/service/mounts";

import { qbittorrentService } from "./qbittorrent";

export const qbittoolsService = new ContainerService("qbittools", {
  image: "registry.gitlab.com/alexkm/qbittools",
  mounts: [confMount("qbittorrent", "/qbittorrent")],
  command: [
    "reannounce",
    "-C",
    "/qbittorrent/qBittorrent.conf",
    "-s",
    qbittorrentService.localUrl,
    "-U",
    getEnv("USERNAME"),
    "-P",
    getEnv("QBITTORRENT_PASSWORD"),
  ],
});
