import assert from "assert";

import { $ } from "bun";
import ky from "ky";
import z from "zod";

export async function getLatestCommit(url: string) {
  const html = await ky.get(url, { retry: 5 }).text();
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

export async function getLatestTag(repo: string) {
  const githubApiToken = await $`gh auth token`.text();
  const githubApi = ky.create({
    headers: {
      Authorization: `Bearer ${githubApiToken}`,
    },
    retry: 5,
  });

  const url = `https://api.github.com/repos/${repo}/tags`;
  const json = await githubApi(url, { retry: 5 }).json(GithubReleaseSchema);
  assert(json[0]);
  return json[0].name;
}

export function ensure<T>(arg: T): NonNullable<T> {
  assert(arg);
  return arg;
}
