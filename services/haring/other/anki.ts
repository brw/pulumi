import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const ankiService = new ContainerService("anki", {
  image: "ankicommunity/anki-sync-server:latest-develop",
  servicePort: 27701,
  envs: {
    ANKISYNCD_AUTH_DB_PATH: "/app/data/auth.db",
    ANKISYNCD_DATA_ROOT: "/app/data/collections",
    ANKISYNCD_SESSION_DB_PATH: "/app/data/session.db",
  },
  mounts: [confMount("anki", "/app/data")],
});
