import { ContainerService } from "~lib/service";
import { confMount } from "~lib/service/mounts";

export const ncpsMigrateDbService = new ContainerService("ncps-migratedb", {
  image: "ghcr.io/kalbasit/ncps:sha-ed423d6",
  mounts: [confMount("ncps", "/storage"), confMount("ncps/var/ncps/db", "/storage/var/ncps/db")],
  command: [
    "/bin/ncps",
    "migrate",
    "up",
    "--cache-database-url=sqlite:/storage/var/ncps/db/db.sqlite",
  ],
  restart: "no",
  attach: true,
});

export const ncpsService = new ContainerService(
  "ncps",
  {
    image: "ghcr.io/kalbasit/ncps:sha-ed423d6",
    servicePort: 8501,
    subdomain: "cache",
    mounts: [confMount("ncps", "/storage")],
    entrypoints: [
      "/bin/ncps",
      "serve",
      "--cache-hostname=cache.bas.sh",
      "--cache-storage-local=/storage",
      "--cache-database-url=sqlite:/storage/var/ncps/db/db.sqlite",
      "--cache-upstream-url=https://cache.nixos.org",
      "--cache-upstream-url=https://nix-community.cachix.org",
      "--cache-upstream-url=https://watersucks.cachix.org",
      "--cache-upstream-url=https://nix-gaming.cachix.org",
      "--cache-upstream-url=https://cache.numtide.com",
      "--cache-upstream-url=https://cache.thalheim.io",
      "--cache-upstream-url=https://attic.xuyh0120.win/lantian",
      "--cache-upstream-public-key=cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY=",
      "--cache-upstream-public-key=nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs=",
      "--cache-upstream-public-key=cache.lix.systems:aBnZUw8zA7H35Cz2RyKFVs3H4PlGTLawyY5KRbvJR8o=",
      "--cache-upstream-public-key=bas.cachix.org-1:LblbDYEqJwBSbBnM4y+uFbBXItBUuvOIYFnr23MYtBk=",
      "--cache-upstream-public-key=nixbuild.net/5WVSYG-1:5B/h8LjKqcxNnNU4fYpWPoDjhEffgeVRzi24UIUjhxs=",
      "--cache-upstream-public-key=watersucks.cachix.org-1:6gadPC5R8iLWQ3EUtfu3GFrVY7X6I4Fwz/ihW25Jbv8=",
      "--cache-upstream-public-key=nix-gaming.cachix.org-1:nbjlureqMbRAxR1gJ/f3hxemL9svXaZF/Ees8vCUUs4=",
      "--cache-upstream-public-key=nix.bas.sh:ufdeOGRzoAuOUJ7kV+A5xkKZ71dB3PgmmOfFjWwL9mI=",
      "--cache-upstream-public-key=niks3.numtide.com-1:DTx8wZduET09hRmMtKdQDxNNthLQETkc/yaX7M4qK0g=",
      "--cache-upstream-public-key=cache.thalheim.io-1:R7msbosLEZKrxk/lKxf9BTjOOH7Ax3H0Qj0/6wiHOgc=",
      "--cache-upstream-public-key=lantian:EeAUQ+W+6r7EtwnmYjeVwx5kOGEBpjlBfPlzGlTNvHc=",
    ],
  },
  { dependsOn: [ncpsMigrateDbService] },
);
