import { exec } from "child_process";
import path from "path";

import { remote } from "@pulumi/command";
import { asset, ResourceHook } from "@pulumi/pulumi";
import { confMount } from "~lib/service/mounts";
import { defaultNetwork } from "~lib/service/networks";
import { ContainerService, defaultConnection } from "~lib/service/service";

import { STATIC_IPS } from "../../ips";

const unboundConfMount = confMount("unbound/custom.conf.d", "/etc/unbound/custom.conf.d");

const valkeyUnboundService = new ContainerService("valkey-unbound", {
  image: "valkey/valkey",
  command: ["--save 300 1", "--loglevel warning"],
  volumes: [{ volumeName: "valkey-unbound", containerPath: "/data" }],
});

const afterConfigUpdateHook = new ResourceHook("after-unbound-config-update", () => {
  console.log("reloading unbound config");
  exec("docker exec unbound unbound-control reload", (error, stdout, stderr) => {
    if (error) {
      console.error(`failed to reload unbound config: ${error}`);
      return;
    }

    console.log(stdout);
    console.error(stderr);
    console.log("unbound config reloaded");
  });
});

export const unboundConfig = new remote.CopyToRemote(
  "unbound-config",
  {
    connection: defaultConnection,
    source: new asset.FileAsset(path.join(import.meta.dirname, "cachedb.conf")),
    remotePath: "/home/bas/docker/unbound/custom.conf.d/cachedb.conf",
  },
  {
    hooks: {
      afterUpdate: [afterConfigUpdateHook],
    },
  },
);

export const unboundService = new ContainerService(
  "unbound",
  {
    image: "klutchell/unbound",
    mounts: [unboundConfMount],
    ulimits: [{ name: "nofile", soft: 65790, hard: 65790 }],
    networksAdvanced: [{ name: defaultNetwork.name, ipv4Address: STATIC_IPS.UNBOUND }],
  },
  {
    dependsOn: valkeyUnboundService.container,
  },
);
