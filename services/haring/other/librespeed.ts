import { getEnv } from "~lib/env";
import { ContainerService } from "~lib/service";

export const librespeedService = new ContainerService("librespeed", {
  image: "ghcr.io/librespeed/speedtest",
  servicePort: 8080,
  hostRule: "Host(`speedtest.bas.sh`) || Host(`speed.bas.sh`)",
  envs: {
    TITLE: "Speedtest | Bas",
    TELEMETRY: true,
    ENABLE_ID_OBFUSCATION: true,
    GDPR_EMAIL: getEnv("EMAIL"),
    PASSWORD: getEnv("LIBRESPEED_PASSWORD"),
    IPINFO_APIKEY: getEnv("IPINFO_APIKEY"),
  },
});
