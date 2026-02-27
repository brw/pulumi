import assert from "assert";
import { ContainerServiceArgs } from "./service";
import { output } from "@pulumi/pulumi";

export function convertLabels(labels: Record<string, string | number | undefined>) {
  return Object.entries(labels).map(([label, value]) => {
    if (value === undefined) {
      throw Error(`value for label "${label}" was undefined`);
    }
    return { label, value: value.toString() };
  });
}

export function convertEnvs(envs: ContainerServiceArgs["envs"]) {
  return output(envs).apply((envs) =>
    Object.entries(envs ?? {}).map(
      ([env, value]) => `${env}=${Array.isArray(value) ? value.join(",") : value}`,
    ),
  );
}

export async function getLatestCommit(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw Error(
      `failed to get latest commit for ${url}: ${res.status} ${res.statusText} - ${await res.text()}`,
    );
  }

  const html = await res.text();
  const commit = html.match(/\/commit\/(\w+)/)?.[1];
  return commit;
}

export function ensure<T>(arg: T): NonNullable<T> {
  assert(arg);
  return arg;
}
