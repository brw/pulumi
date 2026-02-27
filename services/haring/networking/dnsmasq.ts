import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const dnsmasqService = new ContainerService("dnsmasq", {
  image: "jpillora/dnsmasq",
  ports: ["127.0.0.1:53:5353/udp"],
  mounts: [confMount("dnsmasq", "/etc/")],
  capabilities: ["NET_ADMIN"],
});
