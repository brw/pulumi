import { ContainerService } from "~lib/service/service";

export const blueskyService = new ContainerService("bluesky", {
  image: "ghcr.io/brw/social-app",
  servicePort: 8100,
  envs: {
    ATP_PDS_HOST: "https://public.api.bsky.app",
  },
  command: ["bskyweb", "serve"],
  middlewares: ["auth"],
});
