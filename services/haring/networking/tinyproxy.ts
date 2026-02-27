import { interpolate } from "@pulumi/pulumi";
import { ContainerService } from "~lib/service/service";
import { wireguardMullvadService, wireguardProtonService } from "./wireguard";

let tinyproxyService: ContainerService | undefined;

if (wireguardMullvadService.container || wireguardProtonService.container) {
  tinyproxyService = new ContainerService("tinyproxy", {
    image: "kalaksi/tinyproxy",
    envs: {
      LOG_LEVEL: "Info",
      TINYPROXY_UID: 1000,
      TINYPROXY_GID: 1000,
    },
    networkMode: interpolate`container:${(wireguardMullvadService.container ?? wireguardProtonService.container)?.id}`,
  });
}

export { tinyproxyService };
