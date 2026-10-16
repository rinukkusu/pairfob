import { describe, expect, test } from "bun:test";
import { handleFetch, stunUrls } from "./worker.ts";
import { testEnv } from "./testutil/make-room.ts";

async function config(stun?: string): Promise<Record<string, unknown>> {
  const env = { ...testEnv(), ...(stun !== undefined && { STUN_URLS: stun }) };
  const res = await handleFetch(new Request("https://pairfob.com/api/config"), env);
  expect(res.status).toBe(200);
  return (await res.json()) as Record<string, unknown>;
}

describe("/api/config STUN servers", () => {
  test("unset or empty leaves the field out so the PWA keeps its default", async () => {
    expect("stun" in (await config())).toBeFalse();
    expect("stun" in (await config(""))).toBeFalse();
  });

  test("a configured list is advertised in order", async () => {
    expect((await config("stun:a.example:3478, stuns:b.example:5349")).stun)
      .toEqual(["stun:a.example:3478", "stuns:b.example:5349"]);
  });

  test("none advertises no STUN server", async () => {
    expect((await config("none")).stun).toEqual([]);
  });

  test("only stun: and stuns: URLs pass", () => {
    expect(stunUrls("turn:x.example, https://x.example, stun:ok.example")).toEqual(["stun:ok.example"]);
    expect(stunUrls("turn:x.example")).toBeUndefined();
  });
});
