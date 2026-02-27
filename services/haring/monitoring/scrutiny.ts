import { confMount, mount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const scrutinyService = new ContainerService("scrutiny", {
  image: "ghcr.io/analogj/scrutiny:master-omnibus",
  servicePort: 8080,
  mounts: [
    confMount("scrutiny/config", "/opt/scrutiny/config"),
    confMount("scrutiny/influxdb", "/opt/scrutiny/influxdb"),
    mount("/run/udev", "/run/udev", { readOnly: true }),
  ],
  envs: {
    COLLECTOR_CRON_SCHEDULE: "0 * * * *",
  },
  capabilities: ["SYS_RAWIO", "SYS_ADMIN"],
  devices: [
    "sda",
    "sdb",
    "sdc",
    "sdd",
    "sde",
    "sdf",
    "sdg",
    "sdh",
    "sdi",
    "sdj",
    "nvme0",
    "nvme1",
  ].map((i) => ({
    containerPath: `/dev/${i}`,
    hostPath: `/dev/${i}`,
    permissions: "r",
  })),
  middlewares: ["auth"],
});
