import { ContainerService } from "~lib/service/service";

export const syncloungeService = new ContainerService("synclounge", {
  servicePort: 8088,
  envs: {
    AUTH_LIST: "e3b846edd661008e79919a414fdc3b957dad97ac",
  },
});
