import { confMount, dockerSocketRw } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const prunemateService = new ContainerService("prunemate", {
  image: "anoniemerd/prunemate",
  servicePort: 8080,
  mounts: [
    confMount("prunemate/logs", "/var/log"),
    confMount("prunemate/config", "/config"),
    dockerSocketRw,
  ],
  envs: {
    PRUNEMATE_TZ: "Europe/Amsterdam",
    PRUNEMATE_TIME_24H: true,
  },
  middlewares: ["auth"],
});
