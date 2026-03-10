import { JSDOM } from "jsdom";
import pMemoize from "p-memoize";

const CUSTOM_RELAYS = ["https://relay.t4tlabs.net"];

export const fetchRelays = pMemoize(async () => {
  const PULSAR = "https://pulsar.feeds.blue";
  const res = await fetch(PULSAR);
  if (!res.ok) {
    throw Error(`Error on fetching data from Pulsar: ${res.status}`);
  }

  const root = new JSDOM(await res.text());
  const relays = root.window.document
    .querySelectorAll('#results > tbody > tr:has(i[aria-label~="Firehose"]) > td:first-child')
    .values()
    .map((e) => `https://${e.textContent}`)
    .filter((url) => url !== "https://demo.tiny.hose.cam")
    .toArray();

  return relays.concat(CUSTOM_RELAYS);
});
