import type { ContainerPort } from "@pulumi/docker/types/input";
import { output, type UnwrappedObject } from "@pulumi/pulumi";

import type { ContainerServiceArgs } from "./service";

function parsePort(
  input: string | number | UnwrappedObject<ContainerPort>,
  localOnly: boolean = false,
) {
  let ip = localOnly ? "127.0.0.1" : "0.0.0.0";
  let internal: string | number, external: string | number | undefined;
  let protocol: "tcp" | "udp" = "tcp";

  if (typeof input === "object") {
    ip = input.ip ?? ip;
    internal = input.internal;
    external = input.external ?? internal;
    protocol = input.protocol ? (input.protocol === "tcp" ? "tcp" : "udp") : protocol;
  } else {
    if (typeof input === "number") {
      input = String(input);
    }

    const slashIdx = input.lastIndexOf("/");
    if (slashIdx !== -1) {
      const protocolSegment = input.slice(slashIdx + 1);
      protocol = protocolSegment ? (protocolSegment === "tcp" ? "tcp" : "udp") : protocol;
      input = input.slice(0, slashIdx);
    }

    if (input.startsWith("[")) {
      const closingBracketIdx = input.indexOf("]");
      if (closingBracketIdx === -1) {
        throw Error(`missing ']' in port string ${input}`);
      }
      ip = input.slice(1, closingBracketIdx);
      input = input.slice(closingBracketIdx + 1);
    }

    const parts = input.split(":").filter(Boolean);

    if (parts[0] && parts[1] && parts[2]) {
      [ip, external, internal] = parts;
    } else if (parts[0] && parts[1]) {
      if (parts[0].includes(".")) {
        [ip, internal] = parts;
      } else {
        [external, internal] = parts;
      }
    } else if (parts[0]) {
      internal = parts[0];
    } else {
      throw Error(`too many segments for port string ${input}`);
    }

    if (typeof internal === "string") {
      internal = parseInt(internal, 10);
    }

    if (typeof external === "string") {
      external = parseInt(external, 10);
    }

    external ??= internal;
  }

  const portSpec = { ip, internal, external, protocol };

  if (ip === "0.0.0.0") {
    return [
      {
        ...portSpec,
        ip: "::",
      },
      portSpec,
    ];
  } else {
    return portSpec;
  }
}

export function convertPorts(ports: NonNullable<ContainerServiceArgs["ports"]>) {
  return output(ports).apply((ports) =>
    ports
      .flatMap((port) => parsePort(port))
      // recreating pulumi-docker's internal state port order (?)
      .sort((a, b) => {
        if (a.external !== b.external) {
          return a.external - b.external;
        }

        if (a.internal !== b.internal) {
          return a.internal - b.internal;
        }

        if (a.protocol !== b.protocol) {
          return a.protocol.localeCompare(b.protocol);
        }

        if (a.ip !== b.ip) {
          return b.ip.localeCompare(a.ip);
        }

        return 0;
      }),
  );
}
