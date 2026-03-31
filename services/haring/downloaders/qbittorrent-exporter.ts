import { getEnv } from "~lib/env";
import { ContainerService } from "~lib/service/service";

import { qbittorrentService } from "./qbittorrent";

export const qbittorrentExporterService = new ContainerService("qbittorrent-exporter", {
  image: "caseyscarborough/qbittorrent-exporter",
  servicePort: 17871,
  envs: {
    QBITTORRENT_BASE_URL: qbittorrentService.localUrl,
    QBITTORRENT_USERNAME: getEnv("USERNAME"),
    QBITTORRENT_PASSWORD: getEnv("QBITTORRENT_PASSWORD"),
  },
});
