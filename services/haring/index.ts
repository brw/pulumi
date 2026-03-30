export * from "./web/traefik";
export * from "./web/caddy";
export * from "./web/whoami";

export * from "./media/plex";
export * from "./media/tautulli";
export * from "./media/sonarr";
export * from "./media/radarr";
export * from "./media/jackett";
export * from "./media/prowlarr";
export * from "./media/seerr";
// export * from "./media/bazarr";
export * from "./media/autolanguages";
export * from "./media/plexanibridge";
export * from "./media/medialytics";
export * from "./media/autobrr";
// export * from "./media/dashbrr";
export * from "./media/kitana";
export * from "./media/agregarr";
// export * from "./media/maintainerr";
export * from "./media/recyclarr";
export * from "./media/spotarr";
export * from "./media/spotweb";
export * from "./media/tracearr";

// export * from "./monitoring/beszel";
// export * from "./monitoring/glances";
// export * from "./monitoring/certstream";
export * from "./monitoring/grafana";
// export * from "./monitoring/netdata";
export * from "./monitoring/prometheus";
export * from "./monitoring/scrutiny";
export * from "./monitoring/uptimekuma";

// export * from "./networking/dnsmasq";
export * from "./networking/tailscale";
export * from "./networking/tinyproxy";
export * from "./networking/wireguard";
export * from "./networking/unbound/unbound";

// export * from "./downloaders/jdownloader";
export * from "./downloaders/qbittorrent";
export * from "./downloaders/qbittorrent-exporter";
// export * from "./downloaders/qbittools";
export * from "./downloaders/sabnzbd";

export * from "./files/filebrowser";
export * from "./files/filestash";
export * from "./files/h5ai";
// export * from "./files/nextcloud";
// export * from "./files/nextexplorer";
export * from "./files/resilio";
export * from "./files/sftpgo";
// export * from "./files/sist2";
// export * from "./files/spacedrive";
export * from "./files/stash";
export * from "./files/synclounge";

export * from "./atproto/tranquil/tranquil";
export * from "./atproto/pegasus";
export * from "./atproto/pds";
export * from "./atproto/relay";
// export * from "./atproto/social-app";
export * from "./atproto/knot";
export * from "./atproto/spindle";

export * from "./communication/ergo";
export * from "./communication/thelounge";

// export * from "./games/blockheads";
// export * from "./games/hytale";
// export * from "./games/terraria";
export * from "./games/minecraft/servers/akio";
export * from "./games/minecraft/servers/rengoku";
export * from "./games/minecraft/rcon";

export * from "./remote/czkawka";
export * from "./remote/mkvtoolnix";
export * from "./remote/mkv-muxing-batch";
// export * from "./remote/redroid"; // TODO: seems to break my entire server's networking setup somehow?
export * from "./remote/sealskin";

export * from "./other/anki";
// export * from "./other/kopia";
export * from "./other/librespeed";
export * from "./other/pixiv";
export * from "./other/prunemate";

// const syncthingService = new ContainerService("syncthing", {
//   servicePort: 8384,
//   subdomain: "syncthing",
//   ports: [22000, 21027],
//   mounts: [
//     confMount("syncthing"),
//     {
//       source: "/home/bas/data/sync",
//       target: "/sync",
//       type: "bind",
//       bindOptions: {
//         propagation: "rshared",
//       },
//     },
//   ],
// });

// const losslesscutService = new ContainerService("losslesscut", {
//   image: "outlyernet/losslesscut",
//   servicePort: 8080,
//   mounts: [confMount("losslesscut"), dataMount()],
// });

// const signozService = new ContainerService("signoz", {
//   image: "signoz/otel-collector",
//   servicePort: 4317,
//   mounts: [
//     confMount("signoz", "/etc/signoz"),
//     mount("/var/lib/signoz", "/var/lib/signoz", { propagation: "rslave" }),
//   ],
// });

// const selkiesService = new ContainerService("selkies", {
//   servicePort: 3000,
//   envs: {
//     CUSTOM_USER: getEnv("USERNAME"),
//     PASSWORD: getEnv("VNC_PASSWORD"),
//   },
// });

// const seafileMariaDbService = new ContainerService("seafile-mariadb", {
//   image: "mariadb:10.11",
//   mounts: [confMount("seafile-mariadb", "/var/lib/mysql")],
//   envs: {
//     MARIADB_ROOT_PASSWORD: getEnv("SEAFILE_MARIADB_ROOT_PASSWORD"),
//     MARIADB_AUTO_UPGRADE: true,
//   },
// });
//
// const seafileRedisService = new ContainerService("seafile-redis", {
//   image: "redis",
//   command: ["redis-server", "--requirepass", getEnv("SEAFILE_REDIS_PASSWORD")],
// });
//
// const seafileService = new ContainerService(
//   "seafile",
//   {
//     image: "seafileltd/seafile-mc:13.0-latest",
//     servicePort: 80,
//     mounts: [confMount("seafile", "/shared")],
//     envs: {
//       SEAFILE_MYSQL_DB_HOST: "seafile-mariadb",
//       SEAFILE_MYSQL_DB_USER: "seafile",
//       SEAFILE_MYSQL_DB_PASSWORD: getEnv("SEAFILE_MARIADB_USER_PASSWORD"),
//       INIT_SEAFILE_MYSQL_ROOT_PASSWORD: getEnv("SEAFILE_MARIADB_ROOT_PASSWORD"),
//       SEAFILE_MYSQL_DB_CCNET_DB_NAME: "ccnet_db",
//       SEAFILE_MYSQL_DB_SEAFILE_DB_NAME: "seafile_db",
//       SEAFILE_MYSQL_DB_SEAHUB_DB_NAME: "seahub_db",
//       TIME_ZONE: "Europe/Amsterdam",
//       INIT_SEAFILE_ADMIN_EMAIL: getEnv("SEAFILE_ADMIN_EMAIL"),
//       INIT_SEAFILE_ADMIN_PASSWORD: getEnv("SEAFILE_ADMIN_PASSWORD"),
//       SEAFILE_SERVER_HOSTNAME: "seafile.bas.sh",
//       SEAFILE_SERVER_PROTOCOL: "https",
//       REDIS_HOST: "seafile-redis",
//       JWT_PRIVATE_KEY: getEnv("SEAFILE_JWT_PRIVATE_KEY"),
//       REDIS_PASSWORD: getEnv("SEAFILE_REDIS_PASSWORD"),
//     },
//   },
//   {
//     dependsOn: [seafileMariaDbService, seafileRedisService],
//   },
// );

// TODO: try https://github.com/m1k1o/neko
