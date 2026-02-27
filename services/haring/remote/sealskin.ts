import { confMount, ssdcacheMount, dockerSocketRw } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const sealskinService = new ContainerService("sealskin", {
  ports: [8000, 8443],
  mounts: [confMount("sealskin"), ssdcacheMount("sealskin", "/storage"), dockerSocketRw],
  networkMode: "bridge",
});
