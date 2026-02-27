import { getEnv } from "~lib/env";
import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";
import { qbittorrentService } from "./qbittorrent";

let qbittoolsService: ContainerService | undefined;

if (qbittorrentService.localUrl) {
  qbittoolsService = new ContainerService("qbittools", {
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
}

export { qbittoolsService };
