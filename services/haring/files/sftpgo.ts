import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const sftpgoService = new ContainerService("sftpgo", {
  image: "drakkan/sftpgo:plugins",
  servicePort: 8080,
  ports: [2022],
  mounts: [
    confMount("sftpgo", "/var/lib/sftpgo"),
    ssdcacheMount("sftpgo", "/srv/sftpgo"),
    ssdcacheMount("", "/srv/data"),
  ],
  envs: {
    SFTPGO_GRACE_TIME: 60,
  },
  stopTimeout: 60,
});
