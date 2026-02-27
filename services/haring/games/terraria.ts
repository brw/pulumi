import { getEnv } from "~lib/env";
import { nvmeMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const terrariaService = new ContainerService("terraria", {
  image: "passivelemon/terraria-docker:terraria-1.4.5",
  ports: [7777],
  mounts: [nvmeMount("terraria", "/opt/terraria/config")],
  envs: {
    DIFFICULTY: 1,
    MAXPLAYERS: 42,
    PASSWORD: getEnv("TERRARIA_PASSWORD"),
    NPCSTREAM: 1,
    MOTD: "- with <3 from Bas",
  },
  tty: true,
  stdinOpen: true,
});
