import { ContainerService } from "~lib/service";
import { confMount, ssdcacheMount } from "~lib/service/mounts";

export const h5aiService = new ContainerService("h5ai", {
  image: "awesometic/h5ai",
  servicePort: 80,
  mounts: [confMount("h5ai", "/config"), ssdcacheMount("content", "/h5ai")],
  middlewares: ["auth"],
});
