import { confMount, ssdcacheMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";

export const sist2Service = new ContainerService("sist2", {
  image: "sist2app/sist2:x64-linux",
  servicePort: 8080,
  otherServicePorts: { "sist2-web": 4090 },
  mounts: [confMount("sist2", "/sist2-admin"), ssdcacheMount("content/audios", "/host")],
  workingDir: "/root/sist2-admin",
  entrypoints: ["python3"],
  command: ["/root/sist2-admin/sist2_admin/app.py"],
  middlewares: ["auth"],
});

if (sist2Service.container) {
  const elasticsearchService = new ContainerService("elasticsearch", {
    image: "elasticsearch:7.17.28",
    ports: ["127.0.0.1:9200:9200", "127.0.0.1:9300:9300"],
    mounts: [confMount("elasticsearch", "/usr/share/elasticsearch/data")],
    envs: { "discovery.type": "single-node" },
  });
}
