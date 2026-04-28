import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function numberEnv(name: string): number {
  const value = required(name);
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }

  return parsed;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: numberEnv("PORT"),

  databaseUrl: required("DATABASE_URL"),

  rpcUrl: required("RPC_URL"),

  chainId: numberEnv("CHAIN_ID"),
  chainName: process.env.CHAIN_NAME ?? "unknown",

  startBlock: numberEnv("START_BLOCK"),
  confirmations: numberEnv("CONFIRMATIONS"),
  blockBatchSize: numberEnv("BLOCK_BATCH_SIZE"),
  pollIntervalMs: numberEnv("POLL_INTERVAL_MS"),
};