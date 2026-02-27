import { getEnv } from "~lib/env";
import { confMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const spottarrService = new ContainerService("spottarr", {
  image: "ghcr.io/spottarr/spottarr",
  mounts: [confMount("spottarr", "/data")],
  user: "1000:1000",
  envs: {
    USENET__HOSTNAME: getEnv("USENET_HOSTNAME"),
    USENET__USERNAME: getEnv("USENET_USERNAME"),
    USENET__PASSWORD: getEnv("USENET_PASSWORD"),
    USENET__PORT: getEnv("USENET_PORT"),
    USENET__USETLS: "true",
    USENET__MAXCONNECTIONS: "50",
    SPOTNET__RETRIEVEAFTER: "2009-11-01T00:00:00Z",
    SPOTNET__IMPORTBATCHSIZE: "100000",
    SPOTNET__RETENTIONDAYS: "0",
    SPOTNET__IMPORTADULTCONTENT: "true",
  },
});
