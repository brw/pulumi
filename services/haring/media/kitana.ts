import { ContainerService } from "~lib/service/service";

export const kitanaService = new ContainerService("kitana", {
  image: "pannal/kitana",
  servicePort: 31337,
  command: ["-P"],
  volumes: [
    {
      volumeName: "kitana",
      containerPath: "/app/data",
    },
  ],
});
