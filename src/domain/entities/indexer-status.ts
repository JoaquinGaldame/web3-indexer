export type IndexerStatus =
  | "IDLE"
  | "SYNCING"
  | "ERROR"
  | "REORG_DETECTED"
  | "ROLLING_BACK"
  | "PAUSED";