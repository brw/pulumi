import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

const tracearrService = new ContainerService("tracearr", {
  image: "ghcr.io/connorgallopo/tracearr:supervised",
  servicePort: 3000,
  mounts: [confMount("tracearr", "/data/tracearr")],
  volumes: [
    { volumeName: "tracearr-postgres", containerPath: "/data/postgres" },
    { volumeName: "tracearr-redis", containerPath: "/data/redis" },
  ],
});
