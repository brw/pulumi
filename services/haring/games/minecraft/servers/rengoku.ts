import { nvmeMount, mount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";
import { getEnv } from "~lib/env";
import { mcHasOnlinePlayers } from "../util";

// export const velocityRengokuService = new ContainerService("velocity-rengoku", {
//   image: "itzg/mc-proxy:java25",
//   servicePort: 8804, // Plan
//   ports: [
//     {
//       internal: 25565,
//       external: 25562,
//     },
//   ],
//   mounts: [nvmeMount("velocity-rengoku", "/config")],
//   envs: {
//     TYPE: "VELOCITY",
//     EULA: true,
//     VELOCITY_VERSION: "3.4",
//     MINECRAFT_VERSION: "1.21.11",
//     MEMORY: "2G",
//     ICON: "https://i.bas.sh/rengoku.jpg",
//     OVERRIDE_ICON: true,
//     JVM_XX_OPTS:
//       "-XX:+UseZGC -XX:+UseCompactObjectHeaders -XX:+UseTransparentHugePages -XX:+EnableDynamicAgentLoading",
//     ENABLE_RCON: true,
//     RCON_PASSWORD: getEnv("RCON_PASSWORD"),
//
//     // plugins
//     MODRINTH_DOWNLOAD_DEPENDENCIES: "required",
//     MODRINTH_PROJECTS: ["onetimepack", "plan", "antipopup"],
//   },
// });

// export const limboRengokuService = new ContainerService("limbo-rengoku", {
//   image: "itzg/minecraft-server:java25-graalvm",
//   envs: {
//     TYPE: "LIMBO",
//     EULA: true,
//     LIMBO_BUILD: "66",
//   },
// });

export const minecraftRengokuService = new ContainerService(
  "minecraft-rengoku",
  {
    image: "itzg/minecraft-server",
    servicePort: 8804, // Plan
    subdomain: "rengoku",
    ports: [
      {
        internal: 25565,
        external: 25562,
      },
      "25502:25500",
      "24452/udp",
      // "127.0.0.1:2222:2222",
    ],
    otherServicePorts: {
      "polymer-rengoku": 25500,
      "map-rengoku": 8100,
      "amp-rengoku": 25542,
      // "audio-rengoku": 8080,
    },
    restart: "on-failure",
    maxRetryCount: 3,
    mounts: [nvmeMount("minecraft-rengoku", "/data"), mount("/dev/hugepages")],
    envs: {
      // general
      MEMORY: "32G",
      LOG_LEVEL: "debug",
      JVM_XX_OPTS:
        "-XX:+UseZGC -XX:+UseCompactObjectHeaders -XX:+UseTransparentHugePages -XX:+EnableDynamicAgentLoading",
      DISABLE_HEALTHCHECK: true,
      LOG_TIMESTAMP: true,

      // server
      TYPE: "FABRIC",
      EULA: true,
      VERSION: "1.21.11",
      MOTD: "yeet",
      DIFFICULTY: "normal",
      ICON: "https://i.bas.sh/rengoku.jpg",
      OVERRIDE_ICON: true,
      MAX_PLAYERS: 42,
      MAX_BUILD_HEIGHT: 1024,
      VIEW_DISTANCE: 12,
      SYNC_CHUNK_WRITES: false,
      SIMULATION_DISTANCE: 8,
      STOP_DURATION: 20,
      ENABLE_WHITELIST: false,
      ENFORCE_WHITELIST: false,
      WHITELIST: ["basw"],
      ENABLE_SSH: true,
      RCON_PASSWORD: getEnv("RCON_PASSWORD"),
      BROADCAST_RCON_TO_OPS: false,
      BROADCAST_CONSOLE_TO_OPS: false,
      OPS: ["basw"],
      ENFORCE_SECURE_PROFILE: false,
      // MAX_TICK_TIME: 30000,
      ENABLE_COMMAND_BLOCK: true,
      SERVER_NAME: "Rengoku",
      PLAYER_IDLE_TIMEOUT: 0,
      SPAWN_PROTECTION: 0,
      SEED: "-4410415603743001845",

      // mods
      // FABRIC_LOADER_VERSION: "0.17.2",
      CF_API_KEY: getEnv("CURSEFORGE_API_KEY"),
      CF_PARALLEL_DOWNLOADS: 16,
      MODRINTH_DOWNLOAD_DEPENDENCIES: "required",
      MODRINTH_ALLOWED_VERSION_TYPE: "alpha",
      MODRINTH_DEFAULT_EXCLUDE_INCLUDES: "",
      PLAN_DATA_GATHERING_ACCEPT_GEOLITE2_EULA: true, // y dis no work (https://github.com/plan-player-analytics/Plan/commit/24a8c75b67986e90acfc5abeed29328d8cc9407a)
      FABRIC_PROXY_HACK_EARLY_SEND: true,
      APPLY_EXTRA_FILES: [
        // "resources/<https://cdn.modrinth.com/data/Updz14id/versions/wCaoRZ85/URK_RP_3.0.0-beta.zip",
        // "resources/<https://cdn.modrinth.com/data/N5Z6XD09/versions/x3HQPuDq/%5BPOLYMER%5D%20Cabbage%20Glasses.zip",
        // "resources/<https://cdn.modrinth.com/data/VDOYKsGH/versions/KKqVUgbk/Shulker%20Preview%20Resource%20Pack%20%281.21.6%29.zip",
      ],
      DATAPACKS: [
        // "https://cdn.modrinth.com/data/izSO2Rn2/versions/vwYeKHZy/cabbage-substances-1.3.0.2-0.11.1.zip",
      ],
      MODS: [
        "https://github.com/DrexHD/remove-dialog-warning/releases/download/1.2.0/remove-dialog-warning-1.2.0.jar",
        // "https://cdn.modrinth.com/data/5OyO3XKw/versions/lOxOcQ5K/ultimate-roleplay-kit-urk-hats-v3.0.0-beta.jar",
        // "https://cdn.modrinth.com/data/tpBja9mt/versions/ifAYWMMc/ultimate-roleplay-kit-mail-urk-mail-v3.0.0beta.jar",
        "https://cdn.modrinth.com/data/EltpO5cN/versions/NKsNpTwe/lootr-fabric-1.21.11-1.19.33.100.jar",
        "https://cdn.modrinth.com/data/mhlzUYFC/versions/FqHMeEkR/LootrPolymer-1.1.jar",
      ],
      MODRINTH_PROJECTS: [
        // libraries
        "fabric-api",
        // "architectury-api",
        // "yacl",
        // "forge-config-api-port",
        "cloth-config",
        "modmenu",
        // "cristel-lib",
        // "silk",
        // "loot-table-modifier",
        "lithostitched",
        "daisy",

        // world rendering
        "c2me-fabric",
        "distanthorizons",

        // worldgen/structures
        "tectonic",
        "clifftree",
        "ct-overhaul-village",
        // "sparsestructures",
        // "worldgen-patches",
        // "mc-258859",
        // "cliff-face",

        // performance
        "lithium",
        "scalablelux",
        "ferrite-core",
        "noisiumforked",
        "servercore",
        "spark",
        // "clumps", // does ServerCore already cover this?
        "xp-stream",
        "alternate-current",
        "lmd",
        "sepals",
        // "betterview",
        // "moonrise-opt",
        "structure-layout-optimizer",
        "quick-pack",
        // "achievements-optimizer",

        // admin stuff
        // "plan",
        "vanilla-refresh",
        // "axiom",
        "vanish",
        "invview",
        "better-fabric-console",
        // "configured", // TODO: configure?
        // "nbt-copy",
        "im-fast",
        // "stackdeobf",
        // "codecium",
        "chunky",
        "entity-information",
        // "worldgen-devtools",
        // "notenoughcrashes",
        // "worldedit",
        // "axis",
        "pandaantidupe",
        "pandaantipermanentblockbreak",
        // "anti-xray",
        // "holodisplays",
        // "structure-remover",
        // "karns-useful-command", // incompatible with player-ladder due to ride command?
        // "melius-worldmanager",
        "simple-registry-aliases",
        "ledger",
        "command-maker",
        "melius-commands",
        "offlinecommands",
        // "modify-player-data",
        "inv-restore",
        "stdrdc",
        "fabricexporter",
        "otel-instrumentation-extension",

        // networking
        "no-chat-reports",
        // "viafabric",
        // "viabackwards",
        // "fabricproxy-lite",

        // polymer/custom stuff
        // "vestigate",
        "polymer",
        "polydex",
        "polydecorations",
        "polysit",
        "danse",
        // "glide-away",
        "filament",
        // "tsa-decorations",
        // "tsa-stone",
        // "tsa-planks",
        // "tsa-concrete",
        // "serverbacksnow",
        // "trinkets-polymer",
        // "polydoodads"
        // "illager-expansion-polymer", // woodland mansion advancement?
        // "extended-drawers",
        // "extended-drawers-polymer",
        // "spiders-2.0-polymer",
        // "toms-mobs",
        "nice-mobs", // TODO: add resource pack
        // "borukva-food",
        // "borukva-food-exotic",
        // "polychess",
        // "copperwrench",
        // "mining-helmet",
        // "copper-horn",
        "morefurnaces",
        // "datapack:clucking-ducks", // TODO: add resource pack? // also incompatible with clifftree?
        // "datapack:phantomcatcher",
        // "datapack:gardeners-dream",
        // "datapack:banner-bedsheets",
        // "datapack:banner-flags",
        // "faling",
        "visual-jukebox",
        // "baby-fat-polymer",
        // "polyfactory",
        // "puddles",
        // "datapack:shulker-preview-datapack:KKqVUgbk", // manually update resource pack for Polymer
        // "morecatvariants",
        "friends-and-foes-polymer",
        // "mini-vfx",
        // "lootr-polymer-patch",
        // "lootr:NKsNpTwe",
        "more-tools",
        "polynutrition",
        // "notenoughminecraft",
        "polymer-squasher",
        // "navigation-compasses", // java.lang.NullPointerException: Cannot invoke "lol.sylvie.navigation.config.ConfigState.biome()" because "lol.sylvie.navigation.config.ConfigHandler.STATE" is null at knot//lol.sylvie.navigation.item.impl.BiomeLocatorItem.isEnabled(BiomeLocatorItem.java:41) ????
        "polybook:8edHSDUW",
        // "farmers-delight-polymer",
        "blockboy-arcade",
        "copperfire",
        // "vaulted-end",
        "endfire",
        "gone-fishing",
        "universal-graves",
        "colorful-lanterns:nDW5i0HP",
        "colorful-lamp:HTt7AwnG",
        "lovely-snails-polymer",
        // "brewery:d5YLon6f",
        // "datapack:cabbage-substances",
        "better-nether-map",

        // enchantments
        // "enchantments-encore",
        "enchantment-lore",
        // "ly-soulbound-enchantment",
        "datapack:skizzs-enchanted-boats-(unofficial):nahxndRx",
        // "kings-vein-miner",
        "enchantable-mace",
        "eposs-unlimited-enchantments",
        "datapack:ev-enchantable-hats",

        // fixes
        "debugify",
        // "view-distance-fix",
        "rail-placement-fix",
        "disconnect-packet-fix",
        "whiteout",
        // "no-kebab",
        "dragon-movement-fix",
        "shieldstun",
        // "deadplayerchunkupdates", // 404
        "underwater-swim-fix-(mc-220390)",
        "structures-spawn-biomes-fix",
        // "crashexploitfixer",
        "smoothmaps",
        "better-paths",
        "datapack:keepheadnames",
        "maxhealthfix",
        "ghast-direction",
        "attribute-swapping-fix",
        "elytraportalfix",
        "thiocyanate",
        "always-shield",
        // "packet-fixer",
        "fence-gate-fix",

        // fun
        "camera-obscura",
        "player-ladder",
        "image2map",
        "book2map",
        // "ly-dynamite",
        // "micro-fighters",
        "leashable-players",
        // "head-items",
        // "minechess", // TODO: figure out how to remove chessboard lmao
        // "just-player-heads", // TODO: find alternative that allows only dropping player heads for PVP
        // "player-drops-head",
        // "emotes",
        // "more-stands", // kinda covered by Vanilla Refresh?
        // "players-burn-in-sunlight", // heheh
        "eat-bottle",
        // "foxglow",
        // "pandaarchaeology",
        "eg-invisible-frames",
        // "stop-drop-n-roll",
        // "kiss-fabric",
        // "showcase",
        "thgw:RKZbtUks",
        // "snowball-and-egg-knockback",
        "thrown-knockback",
        "launch-command",
        "hide-invis-msgs",
        "jukeboxboat",
        "headindex",
        "peekmod",
        "armorstandeditor",
        // "ultimate-roleplay-kit:lOxOcQ5K",
        // "ultimate-roleplay-kit-mail:ifAYWMMc",
        // "wandering-pets-updated",
        "parrot-sit-on-armorstand",

        // gameplay
        "forgiving-void",
        // "ly-recall-potion",
        "camp-fires-cook-mobs",
        // "healing-campfire",
        "soothing-campfires",
        "comfortable-campfires",
        // "linkart-refabricated",
        "rail-destinations",
        // "audaki-cart-engine",
        "express-carts",
        "move-minecarts",
        "move-boats",
        "warping-wonders",
        "datapack:bell-finds-all-raiders",
        "village-hero-plus",
        "sleep-warp-updated",
        "regenerative-sleep",
        // "rmes-campfire-leather",
        "skippy-pearls",
        // "soul-sight",
        "natural-charcoal",
        // "deaths-door", // Check incompatibilities
        // "useful-mobs",
        // "multi-mine", // seems to leave mining visuals behind for polydecorations/polymer stuff
        "greater-wolves",
        "improved-weather",
        // "improved-maps",
        // "primitive-flaming",
        "extract-poison",
        "fish-on-the-line",
        // "economical-villager-trading",
        "faster-copper-golem",
        // "better-wanderingtraders",
        "noweatherskip",
        "leash-villager",
        "armor-quick-swap",
        "simple-fast-happy-ghasts",
        "chest-on-a-ghast",
        "faewufs-diversity",

        // useful
        "inventory-sorting",
        "kleeslabs", // break only half of the slab you're looking at
        // "villager-death-messages",

        // generic server stuff
        "styled-chat",
        "styledplayerlist",
        "styled-nicknames",
        // "customnametags", // probably largely already covered by styled-nicknames?
        "sdlink",
        // "essential-commands",
        "melius-essentials",
        // "fuji",
        "luckperms",
        "mods-command",
        // "uuid-command",
        "compact-help-command",
        // "server-chat-log-history",
        "afkplus",

        // voice chat
        "simple-voice-chat",
        "voice-chat-interaction",
        // "enhanced-groups",
        // "simple-voice-chat-group-msg",
        "audioplayer",

        // QoL
        "a-minor-convenience",
        "double-doors",
        // "stretchy-leash",
        "pandaleadbreak",
        "more-buttons-data-pack",
        // "witches-drop-blaze-powder",
        // "datapack:hintful-advancements",
        // "datapack:hintful-audio-cues",
        "monsters-in-the-closet:fiqQ08ri",
        "no-offline-time-passage(servers-only)",
        // "tree-in-a-forest",
        "thorny-bush-protection",
        // "burnable-cobwebs",
        "rain-delay",
        // "unlock-all-recipes", // covered by just enough book?
        "logical-efficient-tools",
        "through-the-lily-pads-gently",
        "pretty-beaches",
        "pandablockname",
        "pandanerfphantoms",
        "beaconsaturation",
        // "copper-grates-bubble",
        // "vanilla-pings",
        // "calcmod",
        "purpurpacks-one-step-dyed-shulker-boxes",
        "purpurpacks-more-dyed-wool-and-carpet",
        // "petprotect",
        // "sturdy-vehicles",
        "give-me-that-back",
        "crops-love-rain",
        // "jsst",
        // "leaves-be-gone",
        "leaves-us-in-peace",
        // "improved-signs",
        // "netherportalfix",
        "portal-cornerlink-(orientation-fix)",
        "village-bell-recipe",
        "persistent-parrots",
        "wits",
        "more-fossils:2enM2LIf",
        // "saplanting",
        "ppetp",
        "rail-recipe-rebalance",
        "command-feedback",

        // decorative/aesthetic
        // "boids",
        // "nocturnal-bats", // https://github.com/Estecka/mc-Nocturnal-Bats/issues/3
        "betterwalls:K4OpIv3C",
        // "nemos-blooming-blossom",
        // "fairy-rings",
        // "paleworldfx",

        // Bluemap
        "bluemap",
        // "bluemap-polymer-patch",
        // "bmarker",
        // "bluemap-offline-player-markers-(fabric)",
        // "bluemap-sign-markers",

        // needs optional client mod
        "trashslot",
        "appleskin",
        // "better-stats",
        "skinshuffle",
        "skinrestorer",
        "xaeros-map-server-utils",
        "do-a-barrel-roll",
        "wthit",
        "jade",
        "servux",
        "inventory-management",
        "inventory-essentials",
        "crafting-tweaks",
        // "justenoughbook",
        "rei",
        "polydex2rei",
        // "jei",
        "spyglass-astronomy-sync",
        // "automodpack",

        // -- FUTURE BUT CURRENTLY BROKEN MODS --
        // compatibility issues with other mods
        // "beautified-chat-server", // using Styled Chat instead
        // "sswaystones", // covered by Warping Wonders
        // "echo-compass", // covered by Warping Wonders
        // "default-arms", // covered by Vanilla Refresh
        // "veinminer", // covered by King's Vein Miner
        // "veinminer-enchantment", // covered by King's Vein Miner
        // "mc-258859", // handled by worldgen-patches (which also does snow under trees)

        // not marked as server-only?
        // "goat-expansion",
        // "firefly-in-a-bottle",
        // "better-frost-walker",

        // not updated to 1.21.5
        // "headfix",
        // "improved-village-placement",
        // "datapack:navigable-rivers",
        // "datapack:cliffs-and-coves", // probably not compatible with clifftree
        // "underground-rivers",
        // "pingspam",
        // "datapack:doorbells",
        // "datapack:gurkis-texture-variations",
        // "datapack:mob-wrangler",
        // "faster-random",
        // "astral-plane-dimension",
        // "trimmable-tools",
        // "dyeable-shulkers"

        // errors
        // "server-chat-sync",
        // "longer-chat-history",
        // "streamotes", // covered by Chat Emotes?
        // "hammer-mining-enchantment",
        // "mod-loading-screen",

        // performance?
        // "datapack:chest-bubbles",
        // "datapack:golf_ball",
        // "chunk-debug",
        // "ksyxis", // doesn't support Java 24 it seems https://github.com/VidTu/Ksyxis/issues/70
        // "minecartsloadchunks",
        // "call-of-the-king",
        // "neruina",
        // "velocity-command",
        // "tt20",

        // idk/look into
        // "server-chat-heads",
        // "spawn-animations",
        // "spawn-animations-compats",
        // "midnightlib", // only for spawn-animations
        // "mrshulker",
        // "right-click-chest-boat",
        // "crossbow-enchants",
        // "datapack:colored-axolotl-buckets",
        // "datapack:better_frost_walker",
        // "datapack:better-multishot",
        // "suggestion-tweaker",
        // "better-suggestions",
        // "stylish-stiles", // TODO: check if only server-side?
        // "all-death-messages",

        // meh
        // "name-tag-tweaks",
        // "datapack:talons-freecam",
        // "datapack:talons-jetpack",
        // "realistic-health", // find alternative without potion effects
        // "datapack:minecraft-ost-music-discs", // resource pack for this is 900MB so can't really do that through Polymer
        // "recipe-commands",
      ],
    },
    capabilities: ["SYS_ADMIN"],
    stdinOpen: true,
    tty: true,
    destroyGraceSeconds: 30,
    // stopSignal: "SIGINT",
  },
  {
    ignoreChanges: (await mcHasOnlinePlayers("minecraft-rengoku")) ? ["*"] : [],
  },
);
