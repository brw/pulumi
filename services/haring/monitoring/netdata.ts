import { confMount, mount, dockerSocket } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const netdataService = new ContainerService("netdata", {
  image: "netdata/netdata",
  servicePort: 19999,
  mounts: [
    confMount("netdata/config", "/etc/netdata"),
    confMount("netdata/lib", "/var/lib/netdata"),
    confMount("netdata/cache", "/var/cache/netdata"),
    mount("/", "/host/root", { propagation: "rslave", readOnly: true }),
    mount("/etc/passwd", "/host/etc/passwd", { readOnly: true }),
    mount("/etc/group", "/host/etc/group", { readOnly: true }),
    mount("/etc/localtime", "/host/etc/localtime", { readOnly: true }),
    mount("/proc", "/host/proc", { readOnly: true }),
    mount("/sys", "/host/sys", { readOnly: true }),
    mount("/etc/os-release", "/host/etc/os-release", { readOnly: true }),
    mount("/var/log", "/host/var/log", { readOnly: true }),
    mount("/run/dbus", "/host/run/dbus", { readOnly: true }),
    dockerSocket,
  ],
  capabilities: ["SYS_PTRACE", "SYS_ADMIN"],
  securityOpts: ["apparmor:unconfined"],
  networkMode: "host",
});
