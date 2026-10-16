import { afterEach, expect, test } from "bun:test";
import { directIceServers, setDirectStunUrls } from "./ice-servers.ts";

afterEach(() => setDirectStunUrls(undefined));

test("the origin's STUN list replaces the default, and an empty list gathers locally", () => {
  expect(directIceServers()).toEqual([{ urls: ["stun:stun.cloudflare.com:3478"] }]);
  setDirectStunUrls(["stun:a.example:3478", "stun:b.example:3478"]);
  expect(directIceServers()).toEqual([{ urls: ["stun:a.example:3478", "stun:b.example:3478"] }]);
  setDirectStunUrls([]);
  expect(directIceServers()).toEqual([]);
  setDirectStunUrls(undefined);
  expect(directIceServers()).toEqual([{ urls: ["stun:stun.cloudflare.com:3478"] }]);
});
