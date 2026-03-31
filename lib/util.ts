import assert from "assert";

import { $ } from "bun";
import ky from "ky";
import z from "zod";

export async function getLatestTangledCommit(url: string) {
  const html = await ky(url, { retry: 5 }).text();
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
