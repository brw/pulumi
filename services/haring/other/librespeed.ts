import { getEnv } from "~lib/env";
import { ContainerService } from "~lib/service/service";

export const librespeedService = new ContainerService("librespeed", {
  enabled: true,
  image: "ghcr.io/librespeed/speedtest",
  servicePort: 8080,
  subdomain: "speedtest",
  otherServicePorts: {
    speed: 8080,
  },
  envs: {
    TITLE: "Speedtest | Bas",
    TELEMETRY: true,
    ENABLE_ID_OBFUSCATION: true,
    REDACT_IP_ADDRESSES: true,
    EMAIL: getEnv("EMAIL"),
    PASSWORD: getEnv("LIBRESPEED_PASSWORD"),
    IPINFO_APIKEY: getEnv("IPINFO_APIKEY"),
  },
});
