import { ContainerService } from "~lib/service";
import { confMount } from "~lib/service/mounts";

export const spotwebService = new ContainerService("spotweb", {
  image: "erikdevries/spotweb",
  servicePort: 80,
  mounts: [confMount("spotweb", "/data")],
  envs: {
    DB_ENGINE: "pdo_sqlite",
    DB_NAME: "/data/spotweb.db",
  },
  middlewares: ["auth"],
});
