import { getEnv } from "~lib/env";
import { mount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";
import { Volume } from "@pulumi/docker";
import { haringDockerProvider } from "~lib/service/providers";

const tailscaleVolume = new Volume(
  "tailscale",
  { name: "tailscale" },
  {
    retainOnDelete: true,
    provider: haringDockerProvider,
  },
);

export const tailscaleService = new ContainerService("tailscale", {
  image: "tailscale/tailscale",
  servicePort: 8080,
  volumes: [
    {
      volumeName: tailscaleVolume.name,
      containerPath: "/var/lib/tailscale",
    },
  ],
  mounts: [mount("/lib/modules")],
  envs: {
    TS_ACCEPT_DNS: false,
    TS_AUTHKEY: getEnv("TAILSCALE_AUTH_KEY"),
    TS_HOSTNAME: "haring-docker",
    TS_ENABLE_HEALTH_CHECK: true,
    TS_USERSPACE: true,
    TS_EXTRA_ARGS: "--advertise-exit-node --advertise-tags=tag:container",
    TS_STATE_DIR: "/var/lib/tailscale",
  },
  // networkMode: "host",
  // devices: [{ hostPath: "/dev/net/tun", containerPath: "/dev/net/tun" }],
  capabilities: ["NET_ADMIN", "SYS_MODULE"],
  privileged: true,
});
