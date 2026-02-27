import { mount, confMount, dockerSocket } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

const beszelSocket = mount("/var/run/beszel_socket", "/beszel_socket");

export const beszelService = new ContainerService("beszel", {
  image: "henrygd/beszel",
  servicePort: 8090,
  mounts: [confMount("beszel", "/beszel_data"), beszelSocket],
  healthcheck: {
    tests: ["CMD", "/beszel", "health", "--url", "http://localhost:8090"],
    startPeriod: "5s",
    interval: "1m0s",
  },
});

export const beszelAgentService = new ContainerService("beszel-agent", {
  image: "henrygd/beszel-agent",
  networkMode: "host",
  mounts: [beszelSocket, dockerSocket],
  envs: {
    LISTEN: "/beszel_socket/beszel.sock",
    KEY: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILQa/BKc2uJ0vlog1Cwr2H13Gh3y20eWVL41iwZl+Cyt",
  },
  healthcheck: {
    tests: ["CMD", "/agent", "health"],
    startPeriod: "5s",
    interval: "1m0s",
  },
});
