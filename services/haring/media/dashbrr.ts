import { ContainerService } from "~lib/service";
import { confMount } from "~lib/service/mounts";

export const dashbrrService = new ContainerService("dashbrr", {
  image: "ghcr.io/autobrr/dashbrr",
  servicePort: 8080,
  mounts: [confMount("dashbrr", "/data")],
  envs: {
    DASHBRR__DB_TYPE: "sqlite",
    DASHBRR__DB_PATH: "/data/dashbrr.db",
  },
});
