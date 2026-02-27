import { confMount, gitMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const tautulliService = new ContainerService("tautulli", {
  servicePort: 8181,
  mounts: [
    confMount("tautulli"),
    gitMount(),
    confMount("plex/Library/Application Support/Plex Media Server/Logs", "/plex-logs"),
  ],
  envs: {
    // DOCKER_MODS: "linuxserver/mods:universal-package-install",
    // INSTALL_PIP_PACKAGES: "-r /home/bas/git/PlexAniSync/requirements.txt",
  },
});
