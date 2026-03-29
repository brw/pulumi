import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const certstreamService = new ContainerService("certstream", {
  image: "ghcr.io/reloading01/certstream-server-rust",
  servicePort: 8080,
  mounts: [confMount("certstream", "/data")],
  envs: {
    CERTSTREAM_API_ENABLED: true,
    CERTSTREAM_CONNECTION_LIMIT_ENABLED: true,
    CERTSTREAM_CT_LOG_STATE_FILE: "/data/state.json",
  },
});
