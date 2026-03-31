import { DnsRecord } from "@pulumi/cloudflare";
import { Image } from "@pulumi/docker-build";
import { getEnv } from "~lib/env";
import { dockerSocketRw, nvmeMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";
import { getLatestCommit } from "~lib/util";

const spindleImage = new Image(
  "spindle",
  {
    tags: ["spindle:latest"],
    context: {
      // location: "https://tangled.org/tangled.org/knot-docker.git",
      location: "https://tangled.org/bas.sh/knot-docker.git#fork",
    },
    target: "spindle",
    buildArgs: {
      BUILDKIT_CONTEXT_KEEP_GIT_DIR: "true",
    },
    exports: [
      {
        docker: {},
      },
    ],
    push: false,
    buildOnPreview: false,
  },
  {
    replacementTrigger: await getLatestCommit(
      "https://tangled.org/bas.sh/knot-docker/commits/fork",
    ),
  },
);

export const spindleService = new ContainerService("spindle", {
  localImage: spindleImage.digest,
  servicePort: 6555,
  mounts: [nvmeMount("spindle", "/app"), dockerSocketRw],
  envs: {
    SPINDLE_SERVER_HOSTNAME: "spindle.bas.sh",
    SPINDLE_SERVER_OWNER: getEnv("ATPROTO_DID"),
  },
});

export const spindleDnsRecord = new DnsRecord("spindle", {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: "spindle",
  ttl: 1,
  type: "CNAME",
  content: "haring.bas.sh",
  proxied: false,
});
