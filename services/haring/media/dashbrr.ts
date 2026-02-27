import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const dashbrrService = new ContainerService("dashbrr", {
  image: "ghcr.io/autobrr/dashbrr",
  servicePort: 8080,
  mounts: [confMount("dashbrr", "/data")],
  envs: {
    DASHBRR__DB_TYPE: "sqlite",
    DASHBRR__DB_PATH: "/data/dashbrr.db",
  },
});
