// src/interfaces/workers/sync.worker.ts

import { Interface } from "ethers";
import { env } from "../../infraestructure/config/env";
import { pool } from "../../infraestructure/db";

import { EthersBlockchainClient, EthersEventDecoder } from "../../infraestructure/blockchain";

import { DrizzleCheckpointRepository } from "../../infraestructure/db/repositories";
import { DrizzleRawLogRepository } from "../../infraestructure/db/repositories";
import { DrizzleIndexedBlockRepository } from "../../infraestructure/db/repositories";
import { DrizzleErc20TransferRepository } from "../../infraestructure/db/repositories";


import { BlockRangePlanner } from "../../application/services/block-range-planner";
import { SyncContractEventsUseCase } from "../../application/use-cases/sync-contract-events.use-case";

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const erc20Interface = new Interface(ERC20_ABI);
const transferTopic = erc20Interface.getEvent("Transfer")?.topicHash;

if (!transferTopic) {
  throw new Error("Could not resolve ERC20 Transfer topic");
}

/**
 * TEMPORARY indexing targets.
 *
 * Later this should move to a DB table:
 * indexing_targets(chain_id, contract_address, event_name, topic0, start_block, enabled)
 */
const targets = [
  {
    contractAddress: "0x56734d768F15954C0eEFcfB4063eF31fFB35A880",
    eventName: "Transfer",
    topics: [transferTopic],
    startBlock: env.startBlock,
  },
];

const blockchainClient = new EthersBlockchainClient({
  rpcUrl: env.rpcUrl,
  chainId: env.chainId,
});

const eventDecoder = new EthersEventDecoder();
const blockRangePlanner = new BlockRangePlanner();

const checkpointRepository = new DrizzleCheckpointRepository();
const rawLogRepository = new DrizzleRawLogRepository();
const indexedBlockRepository = new DrizzleIndexedBlockRepository();
const erc20TransferRepository = new DrizzleErc20TransferRepository();

const syncContractEventsUseCase = new SyncContractEventsUseCase(
  blockchainClient,
  checkpointRepository,
  rawLogRepository,
  indexedBlockRepository,
  erc20TransferRepository,
  eventDecoder,
  blockRangePlanner
);

async function runOnce(): Promise<void> {
  for (const target of targets) {
    const result = await syncContractEventsUseCase.execute({
      chainId: env.chainId,
      contractAddress: target.contractAddress,
      eventName: target.eventName,
      startBlock: target.startBlock,
      confirmations: env.confirmations,
      batchSize: env.blockBatchSize,
      topics: target.topics,
    });

    console.log("[sync-result]", result);
  }
}

async function loop(): Promise<void> {
  try {
    await runOnce();
  } catch (error) {
    console.error("[sync-error]", error);
  } finally {
    setTimeout(() => {
      void loop();
    }, env.pollIntervalMs);
  }
}

process.on("SIGINT", async () => {
  console.log("[shutdown] SIGINT received");
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("[shutdown] SIGTERM received");
  await pool.end();
  process.exit(0);
});

void loop();