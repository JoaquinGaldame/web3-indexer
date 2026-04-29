import {
  bigint,
  boolean,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const indexerCheckpoints = pgTable(
  "indexer_checkpoints",
  {
    chainId: integer("chain_id").notNull(),
    contractAddress: text("contract_address").notNull(),
    eventName: text("event_name").notNull(),

    lastProcessedBlock: bigint("last_processed_block", {
      mode: "number",
    }).notNull(),

    lastSafeBlock: bigint("last_safe_block", {
      mode: "number",
    }).notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.chainId, table.contractAddress, table.eventName],
    }),
  })
);

export const indexedBlocks = pgTable(
  "indexed_blocks",
  {
    chainId: integer("chain_id").notNull(),

    blockNumber: bigint("block_number", {
      mode: "number",
    }).notNull(),

    blockHash: text("block_hash").notNull(),
    parentHash: text("parent_hash").notNull(),

    indexedAt: timestamp("indexed_at", {
      withTimezone: true,
    })
    .notNull()
    .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.chainId, table.blockNumber],
    }),
  })
);

export const rawLogs = pgTable(
  "raw_logs",
  {
    chainId: integer("chain_id").notNull(),

    blockNumber: bigint("block_number", {
      mode: "number",
    }).notNull(),

    blockHash: text("block_hash").notNull(),
    transactionHash: text("transaction_hash").notNull(),
    logIndex: integer("log_index").notNull(),
    contractAddress: text("contract_address").notNull(),

    topics: text("topics").array().notNull(),
    data: text("data").notNull(),
    removed: boolean("removed").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
    .notNull()
    .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.chainId, table.transactionHash, table.logIndex],
    }),
  })
);

export const erc20Transfers = pgTable(
  "erc20_transfers",
  {
    chainId: integer("chain_id").notNull(),
    contractAddress: text("contract_address").notNull(),

    blockNumber: bigint("block_number", {
      mode: "number",
    }).notNull(),

    blockHash: text("block_hash").notNull(),
    transactionHash: text("transaction_hash").notNull(),
    logIndex: integer("log_index").notNull(),

    fromAddress: text("from_address").notNull(),
    toAddress: text("to_address").notNull(),

    value: numeric("value").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
    .notNull()
    .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.chainId, table.transactionHash, table.logIndex],
    }),
  })
);