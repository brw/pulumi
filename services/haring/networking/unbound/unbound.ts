import { remote } from "@pulumi/command";
import { asset, interpolate } from "@pulumi/pulumi";
import path from "path";
import { getEnv } from "~lib/env";
import { confMount } from "~lib/service/mounts";
import { defaultNetwork } from "~lib/service/networks";
import { ContainerService, defaultConnection } from "~lib/service/service";

const unboundConfMount = confMount("unbound/custom.conf.d", "/etc/unbound/custom.conf.d");

const valkeyUnboundService = new ContainerService("valkey-unbound", {
  image: "valkey/valkey",
  command: [
    interpolate`--requirepass ${getEnv("VALKEY_PASSWORD")}`,
    "--save 300 1",
    "--loglevel warning",
  ],
  volumes: [{ volumeName: "valkey-unbound", containerPath: "/data" }],
});

const unboundConfig = new remote.CopyToRemote("unbound-config", {
  connection: defaultConnection,
  source: new asset.FileAsset(path.join(import.meta.dirname, "cachedb.conf")),
  remotePath: "/home/bas/docker/unbound/cachedb.conf",
});

export const UNBOUND_ADDRESS = "172.18.1.1";

export const unboundService = new ContainerService(
  "unbound",
  {
    image: "klutchell/unbound",
    mounts: [unboundConfMount],
    networksAdvanced: [{ name: defaultNetwork.name, ipv4Address: UNBOUND_ADDRESS }],
  },
  {
    dependsOn: valkeyUnboundService.container,
  },
);
