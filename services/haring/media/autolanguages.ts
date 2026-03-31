import { getEnv } from "~lib/env";
import { ContainerService } from "~lib/service/service";

import { plexService } from "./plex";

export const autolanguagesService = new ContainerService("autolanguages", {
  // image: "remirigal/plex-auto-languages",
  image: "journeyover/plex-auto-languages",
  envs: {
    PLEX_TOKEN: getEnv("PLEX_TOKEN"),
    PLEX_URL: plexService.localUrl,
    UPDATE_LEVEL: "season",
    TRIGGER_ON_ACTIVITY: true,
    REFRESH_ON_SCAN: true,
    NOTIFICATIONS_ENABLE: true,
    NOTIFICATIONS_APPRISE_CONFIGS: `[{ urls: ["${getEnv("AUTO_LANGUAGES_DISCORD_WEBHOOK")}"], events: ["play_or_activity", "scheduler"] }]`,
  },
});
