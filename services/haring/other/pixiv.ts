import { ContainerService } from "~lib/service";
import { confMount } from "~lib/service/mounts";

export const pixivPublicToPrivateService = new ContainerService("pixiv-public-to-private", {
  image: "ghcr.io/tomacheese/pixiv-public-to-private",
  mounts: [confMount("pixiv-public-to-private", "/data")],
});
