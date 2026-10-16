export interface Env {
  DB: D1Database;
  DAEMON_ROOM: DurableObjectNamespace;
  PAIRING_INDEX: DurableObjectNamespace;
  ASSETS?: Fetcher;
  METRICS?: AnalyticsEngineDataset;
  OPERATOR_TOKEN: string;
  IP_HASH_PEPPER: string;
  BUILD?: string;
  P2P_OPEN?: string;
  /** Comma-separated STUN URLs for the PWA; unset or empty keeps its default, "none" disables STUN. */
  STUN_URLS?: string;
  INTENT_PAD_MS?: string;
}
