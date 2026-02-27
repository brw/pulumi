import { DnsRecord } from "@pulumi/cloudflare";
import { Image } from "@pulumi/docker-build";
import { getEnv } from "~lib/env";
import { confMount, dockerSocketRw, nvmeMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";
import { getLatestCommit } from "~lib/service/util";

const knotImage = new Image(
  "knot",
  {
    tags: ["knot:latest"],
    context: {
      // location: "https://tangled.org/tangled.org/knot-docker.git",
      location: "https://tangled.org/bas.sh/knot-docker.git#spindle",
    },
    target: "knot",
    buildArgs: {
      BUILDKIT_CONTEXT_KEEP_GIT_DIR: "true",
    },
    exports: [
      {
        docker: {},
      },
    ],
    push: false,
  },
  {
    replacementTrigger: await getLatestCommit(
      "https://tangled.org/bas.sh/knot-docker/commits/spindle",
    ),
  },
);

export const knotService = new ContainerService("knot", {
  localImage: knotImage.digest,
  servicePort: 5555,
  ports: [22],
  mounts: [confMount("knot", "/app"), nvmeMount("knot", "/home/git/repositories")],
  volumes: [{ volumeName: "knot-keys", containerPath: "/etc/ssh/keys" }],
  envs: {
    KNOT_SERVER_HOSTNAME: "knot.bas.sh",
    KNOT_SERVER_OWNER: getEnv("ATPROTO_DID"),
    KNOT_SERVER_DB_PATH: "/app/knotserver.db",
    KNOT_SERVER_INTERNAL_LISTEN_ADDR: "localhost:5444",
  },
});

export const knotDnsRecord = new DnsRecord("knot", {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: "knot",
  ttl: 1,
  type: "CNAME",
  content: "haring.bas.sh",
  proxied: false,
});

const spindleImage = new Image(
  "spindle",
  {
    tags: ["spindle:latest"],
    context: {
      // location: "https://tangled.org/tangled.org/knot-docker.git",
      location: "https://tangled.org/bas.sh/knot-docker.git#spindle",
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
  },
  {
    replacementTrigger: await getLatestCommit(
      "https://tangled.org/bas.sh/knot-docker/commits/spindle",
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

const _spindleDnsRecord = new DnsRecord("spindle", {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: "spindle",
  ttl: 1,
  type: "CNAME",
  content: "haring.bas.sh",
  proxied: false,
});
