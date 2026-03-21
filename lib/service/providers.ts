import { Provider } from "@pulumi/docker";

export const haringDockerProvider = new Provider("haring", {
  host: "ssh://haring",
  context: "haring",
});

export const kaneelnasDockerProvider = new Provider("kaneelnas", {
  host: "ssh://kaneelnas",
  context: "kaneelnas",
});
