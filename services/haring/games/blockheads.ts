import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const blockheadsService = new ContainerService("blockheads", {
  image: "theblockheads/server:development",
  servicePort: 15151,
  ports: [15151, "15151/udp"],
  mounts: [
    confMount("blockheads/config", "/blockheads"),
    confMount("blockheads/worlds", "/root/GNUstep/Library/ApplicationSupport/TheBlockheads/saves"),
  ],
  envs: {
    WORLD_NAME: "bmc",
    WORLD_ID: "bmc",
    // WORLD_OWNER: "",
    MAX_PLAYERS: 32,
    SAVE_DELAY: 1,
    WORLD_OWNER: "bas",
    SERVER_PORT: 15151,
  },
});
