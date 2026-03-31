import { getEnv } from "~lib/env";
import { ContainerService } from "~lib/service/service";

export const librespeedService = new ContainerService("librespeed", {
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
    GDPR_EMAIL: getEnv("EMAIL"),
    PASSWORD: getEnv("LIBRESPEED_PASSWORD"),
    IPINFO_APIKEY: getEnv("IPINFO_APIKEY"),
  },
});
