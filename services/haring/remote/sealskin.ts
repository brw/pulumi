import { ContainerService } from "~lib/service";
import { confMount, ssdcacheMount, dockerSocket } from "~lib/service/mounts";

export const sealskinService = new ContainerService("sealskin", {
  ports: [8000, 8443],
  mounts: [confMount("sealskin"), ssdcacheMount("sealskin", "/storage"), dockerSocket],
  networkMode: "bridge",
});
