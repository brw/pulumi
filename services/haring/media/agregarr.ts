import { ContainerService } from "~lib/service";
import { confMount } from "~lib/service/mounts";

export const agregarrService = new ContainerService("agregarr", {
  image: "agregarr/agregarr",
  servicePort: 7171,
  mounts: [confMount("agregarr", "/app/config")],
});
