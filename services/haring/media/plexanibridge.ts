import { getEnv } from "~lib/env";
import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";
import { plexService } from "./plex";

let plexAniBridgeService: ContainerService | undefined;

if (plexService?.localUrl) {
  plexAniBridgeService = new ContainerService("plexanibridge", {
    image: "ghcr.io/eliasbenb/plexanibridge",
    servicePort: 4848,
    mounts: [confMount("plexanibridge")],
    envs: {
      PAB_LOG_LEVEL: "DEBUG",
      PAB_PLEX_TOKEN: getEnv("PLEX_TOKEN"),
      PAB_PLEX_URL: plexService.localUrl,
      PAB_PLEX_SECTIONS: JSON.stringify(["TV Anime", "Movies Anime"]),
      // PAB_PROFILES__1__ANILIST_TOKEN: getEnv("ANILIST_TOKEN_1"),
      // PAB_PROFILES__1__PLEX_USER: getEnv("PLEX_USER_1"),
      PAB_PROFILES__2__ANILIST_TOKEN: getEnv("ANILIST_TOKEN_2"),
      PAB_PROFILES__2__PLEX_USER: getEnv("PLEX_USER_2"),
      PAB_PROFILES__2__EXCLUDED_SYNC_FIELDS: JSON.stringify([]),
      PAB_PROFILES__3__ANILIST_TOKEN: getEnv("ANILIST_TOKEN_3"),
      PAB_PROFILES__3__PLEX_USER: getEnv("PLEX_USER_3"),
      PAB_PROFILES__3__EXCLUDED_SYNC_FIELDS: JSON.stringify([]),
      PAB_PROFILES__4__ANILIST_TOKEN: getEnv("ANILIST_TOKEN_4"),
      PAB_PROFILES__4__PLEX_USER: getEnv("PLEX_USER_4"),
      PAB_PROFILES__4__EXCLUDED_SYNC_FIELDS: JSON.stringify([]),
    },
    middlewares: ["auth"],
  });
}

export { plexAniBridgeService };
