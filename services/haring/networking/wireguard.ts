import { confMount, mount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const wireguardProtonService = new ContainerService("wireguard-proton", {
  image: "lscr.io/linuxserver/wireguard",
  // ports: [32400, "51820/udp"],
  ports: [32400, 32401, "51820/udp", "127.0.0.1:8889:8888"],
  mounts: [confMount("wireguard-proton"), mount("/lib/modules")],
  // envs: ["PEERS=2"],
  // privileged: true,
  capabilities: ["NET_ADMIN", "SYS_MODULE"],
  sysctls: { "net.ipv4.conf.all.src_valid_mark": "1" },
  healthcheck: {
    tests: ["CMD", "/usr/bin/curl", "-sS", "icanhazip.com"],
    interval: "20s",
    retries: 3,
    timeout: "10s",
  },
  cpuShares: 2048,
});

export const wireguardMullvadService = new ContainerService("wireguard-mullvad", {
  enabled: false,
  image: "lscr.io/linuxserver/wireguard",
  // ports: [8888],
  mounts: [confMount("wireguard-mullvad"), mount("/lib/modules")],
  // envs: ["PEERS=2"],
  // privileged: true,
  capabilities: ["NET_ADMIN", "SYS_MODULE"],
  sysctls: { "net.ipv4.conf.all.src_valid_mark": "1" },
  healthcheck: {
    tests: ["CMD", "/usr/bin/curl", "-sS", "icanhazip.com"],
    interval: "20s",
    retries: 3,
    timeout: "10s",
  },
  cpuShares: 2048,
});
