import assert from "assert";

import type { Input, Output } from "@pulumi/pulumi";
import { $ } from "bun";
import ky from "ky";
import z from "zod";

export async function getLatestTangledCommit(url: string) {
  const html = await ky(url, {
    retry: {
      limit: 10,
      retryOnTimeout: true,
    },
  }).text();
  const commit = html.match(/\/commit\/(\w+)/)?.[1];
  return commit;
}

const GithubReleaseSchema = z
  .array(
    z.object({
      name: z.string(),
    }),
  )
  .min(1);

export async function getLatestGithubTag(repo: string) {
  const output = await $`gh api repos/${repo}/tags`.json();
  const json = GithubReleaseSchema.parse(output);
  assert(json[0]);
  return json[0].name;
}

export async function getGithubContents(repo: string, dir?: string) {
  return await $`gh api repos/${repo}/contents/${dir ?? ""}`.json();
}

export function ensure<T>(arg: T): NonNullable<T> {
  assert(arg);
  return arg;
}

// export function prefix<T extends Record<string, unknown>>(prefix: string, obj: T): T {
//   return Object.fromEntries(Object.entries(obj).map(([key, value]) => [`${prefix}_${key}`, value]));
// }

export const toHostRule = (domains: string[]) =>
  domains.map((domain) => `Host(\`${domain}\`)`).join(" || ");
