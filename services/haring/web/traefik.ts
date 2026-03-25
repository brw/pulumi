import { Volume } from "@pulumi/docker";
import { ContainerService } from "~lib/service/service";
import { dockerSocket } from "~lib/service/mounts";
import { getEnv } from "~lib/env";
import { haringDockerProvider } from "~lib/service/providers";
import { SECRET_LABELS } from "./traefik-secrets";

const traefikVolume = new Volume(
  "traefik",
  { name: "traefik" },
  {
    retainOnDelete: true,
    provider: haringDockerProvider,
    replacementTrigger: true,
  },
);

export const traefikService = new ContainerService(
  "traefik",
  {
    image: "traefik",
    servicePort: 8080,
    volumes: [
      {
        volumeName: traefikVolume.name,
        containerPath: "/etc/traefik",
      },
    ],
    mounts: [dockerSocket],
    ports: [80, 443, "443/udp"],
    envs: {
      CF_API_EMAIL: getEnv("EMAIL"),
      CF_API_KEY: getEnv("CLOUDFLARE_API_KEY"),
    },
    cpuShares: 2048,
    command: [
      "--api",
      // "--accesslog=true",
      // "--accesslog.format=json",
      // "--accesslog.fields.headers.defaultmode=keep",

      "--providers.docker.exposedbydefault=false",
      "--providers.docker.network=haring",

      "--serverstransport.insecureskipverify",

      "--entrypoints.http.address=[::]:80",
      "--entrypoints.http.reusePort=true",
      "--entrypoints.https.address=[::]:443",
      "--entrypoints.https.reusePort=true",
      // "--entrypoints.http.address=0.0.0.0:80",
      // "--entrypoints.https.address=0.0.0.0:443",
      "--entrypoints.https.http3",
      "--entrypoints.https.http.tls=true",
      "--entrypoints.https.http.tls.certresolver=cloudflare",
      "--entrypoints.https.http.tls.domains[0].main=bas.sh",
      "--entrypoints.https.http.tls.domains[0].sans=*.bas.sh,*.tranquil.bas.sh,*.pegasus.bas.sh,*.on.bas.sh,*.t.bas.sh,*.of.bas.sh",
      "--entrypoints.https.http.tls.domains[1].main=danimutiara.nl",
      "--entrypoints.https.http.tls.domains[1].sans=*.danimutiara.nl",

      "--certificatesresolvers.cloudflare.acme.dnschallenge=true",
      "--certificatesresolvers.cloudflare.acme.dnschallenge.provider=cloudflare",
      // "--certificatesresolvers.cloudflare.acme.dnschallenge.resolvers=1.1.1.1:53,8.8.8.8:53",
      "--certificatesresolvers.cloudflare.acme.dnschallenge.resolvers=8.8.8.8:53",
      "--certificatesresolvers.cloudflare.acme.storage=/etc/traefik/acme.json",
      `--certificatesresolvers.cloudflare.acme.email=${getEnv("EMAIL")}`,

      // "--experimental.plugins.cloudflare.modulename=github.com/agence-gaya/traefik-plugin-cloudflare",
      // "--experimental.plugins.cloudflare.version=v1.2.0",
      "--experimental.plugins.cloudflare.modulename=github.com/PseudoResonance/cloudflarewarp",
      "--experimental.plugins.cloudflare.version=v1.4.2",

      "--experimental.plugins.staticresponse.modulename=github.com/jdel/staticresponse",
      "--experimental.plugins.staticresponse.version=v0.0.1",

      "--metrics.prometheus=true",
      "--metrics.prometheus.addEntryPointsLabels=true",
      "--metrics.prometheus.addServicesLabels=true",
      "--metrics.prometheus.addRoutersLabels=true",
      "--metrics.prometheus.buckets=0.1,0.3,1.2,5.0",
      "--metrics.prometheus.manualRouting=true",

      // "--metrics.otlp=true",
      // `--metrics.otlp.address=`,
    ],
    labels: {
      "traefik.http.middlewares.httpsredirect.redirectscheme.scheme": "https",
      "traefik.http.middlewares.httpsredirect.redirectscheme.permanent": "true",
      "traefik.http.routers.httpsredirect.rule": "HostRegexp(`.+`)",
      "traefik.http.routers.httpsredirect.entrypoints": "http",
      "traefik.http.routers.httpsredirect.middlewares": "cloudflare,httpsredirect",

      "traefik.http.middlewares.auth.basicauth.users":
        "bas:$2y$05$XUkzwNnxl2sdNIMqrqspsulGw6fbj1smtwk7bMClLiDIsrR3EatOG",

      // "traefik.http.middlewares.cloudflare.plugin.cloudflare.allowedCIDRs": "0.0.0.0/0,::/0",
      // "traefik.http.middlewares.cloudflare.plugin.cloudflare.refreshInterval": "24h",
      // "traefik.http.middlewares.cloudflare.plugin.cloudflare.debug": "true",
      "traefik.http.middlewares.cloudflare.plugin.cloudflare.disableDefault": "false",

      "traefik.http.middlewares.atproto-did.plugin.staticresponse.statuscode": "200",
      "traefik.http.middlewares.atproto-did.plugin.staticresponse.body": getEnv("ATPROTO_DID"),
      "traefik.http.middlewares.atproto-did-cors.headers.accesscontrolallowmethods": "GET",
      "traefik.http.middlewares.atproto-did-cors.headers.accesscontrolallowheaders": "*",
      "traefik.http.middlewares.atproto-did-cors.headers.accesscontrolalloworiginlist": "*",
      "traefik.http.routers.atproto-did.rule": "Host(`bas.sh`) && Path(`/.well-known/atproto-did`)",
      "traefik.http.routers.atproto-did.entrypoints": "https",
      "traefik.http.routers.atproto-did.middlewares": "cloudflare,atproto-did-cors,atproto-did",

      "traefik.http.middlewares.relay.headers.customrequestheaders.Origin": "",

      "traefik.http.routers.traefik-bas-sh.service": "api@internal",
      "traefik.http.routers.traefik-bas-sh.middlewares": "cloudflare,auth",

      "traefik.http.routers.metrics.service": "prometheus@internal",
      "traefik.http.routers.metrics.rule": "Host(`metrics.bas.sh`)",
      "traefik.http.routers.metrics.entrypoints": "https",
      "traefik.http.routers.metrics.middlewares": "cloudflare,auth",

      ...SECRET_LABELS,
    },
  },
  {
    // deleteBeforeReplace: false,
  },
);
