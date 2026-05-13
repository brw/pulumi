import { ContainerService } from "~lib/service";
import { confMount, dockerSocket } from "~lib/service/mounts";

export const prunemateService = new ContainerService("prunemate", {
  image: "anoniemerd/prunemate",
  servicePort: 8080,
  mounts: [
    confMount("prunemate/logs", "/var/log"),
    confMount("prunemate/config", "/config"),
    dockerSocket,
  ],
  envs: {
    PRUNEMATE_TZ: "Europe/Amsterdam",
    PRUNEMATE_TIME_24H: true,
  },
  middlewares: ["auth"],
});
