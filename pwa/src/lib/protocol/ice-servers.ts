/**
 * STUN servers for the direct upgrade. Boot adopts the origin's list from
 * `/api/config`; an origin that does not send one keeps the default.
 */
const DEFAULT_STUN_URLS: readonly string[] = ["stun:stun.cloudflare.com:3478"];
let stunUrls = DEFAULT_STUN_URLS;

/** `undefined` restores the default; `[]` gathers local candidates only. */
export function setDirectStunUrls(urls: readonly string[] | undefined): void {
  stunUrls = urls ? [...urls] : DEFAULT_STUN_URLS;
}

export function directIceServers(): RTCIceServer[] {
  return stunUrls.length > 0 ? [{ urls: [...stunUrls] }] : [];
}
