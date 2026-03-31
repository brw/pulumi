import { interpolate } from "@pulumi/pulumi";
import { ContainerService } from "~lib/service/service";

import { wireguardProtonService } from "./wireguard";

export const tinyproxyService = new ContainerService("tinyproxy", {
  image: "kalaksi/tinyproxy",
  envs: {
    LOG_LEVEL: "Info",
    TINYPROXY_UID: 1000,
    TINYPROXY_GID: 1000,
  },
  networkMode: interpolate`container:${wireguardProtonService.container.id}`,
});
