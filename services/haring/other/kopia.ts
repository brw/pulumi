import { interpolate } from "@pulumi/pulumi";
import { getEnv } from "~lib/env";
import { ContainerService } from "~lib/service";
import { confMount, dataMount, mount } from "~lib/service/mounts";

export const kopiaService = new ContainerService("kopia", {
  image: "kopia/kopia",
  servicePort: 51515,
  hostname: "Bas",
  envs: {
    USER: getEnv("USERNAME"),
    KOPIA_PASSWORD: getEnv("KOPIA_PASSWORD"),
  },
  mounts: [
    confMount("kopia", "/app"),
    dataMount("kopia", "/repository"),
    mount("/tmp/kopia", "/tmp"),
    mount("/home/bas/.config/rclone", "/app/rclone"),
  ],
  command: [
    "server",
    "start",
    "--disable-csrf-token-checks",
    "--insecure",
    "--address=0.0.0.0:51515",
    `--server-username=${getEnv("USERNAME")}`,
    interpolate`--server-password=${getEnv("KOPIA_PASSWORD")}`,
  ],
});
