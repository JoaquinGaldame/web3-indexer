import { Interface } from "ethers";

import { env } from "../../infraestructure/config/env";
import { EthersBlockchainClient } from "../../infraestructure/blockchain";
import { EthersEventDecoder } from "../../infraestructure/blockchain";
import { BlockRangePlanner } from "../../application/services/block-range-planner";
import { SyncContractEventsUseCase } from "../../application/use-cases/sync-contract-events.use-case";

// Próximo paso: reemplazar estos imports por repositorios Drizzle reales
// import { DrizzleCheckpointRepository } from "../../infrastructure/db/repositories/drizzle-checkpoint.repository";
// import { DrizzleRawLogRepository } from "../../infrastructure/db/repositories/drizzle-raw-log.repository";
// import { DrizzleIndexedBlockRepository } from "../../infrastructure/db/repositories/drizzle-indexed-block.repository";
// import { DrizzleErc20TransferRepository } from "../../infrastructure/db/repositories/drizzle-erc20-transfer.repository";

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const erc20Interface = new Interface(ERC20_ABI);
const transferTopic = erc20Interface.getEvent("Transfer")?.topicHash;

if (!transferTopic) {
  throw new Error("Could not resolve ERC20 Transfer topic");
}

const targets = [
  {
    contractAddress: "0x0000000000000000000000000000000000000000",
    eventName: "Transfer",
    topics: [transferTopic],
    startBlock: env.startBlock,
  },
];

async function runOnce() {
  const blockchainClient = new EthersBlockchainClient({
    rpcUrl: env.rpcUrl,
    chainId: env.chainId,
  });

  const eventDecoder = new EthersEventDecoder();
  const blockRangePlanner = new BlockRangePlanner();

  // Todavía faltan estos adapters reales
  const checkpointRepository = undefined as never;
  const rawLogRepository = undefined as never;
  const indexedBlockRepository = undefined as never;
  const erc20TransferRepository = undefined as never;

  const syncContractEventsUseCase = new SyncContractEventsUseCase(
    blockchainClient,
    checkpointRepository,
    rawLogRepository,
    indexedBlockRepository,
    erc20TransferRepository,
    eventDecoder,
    blockRangePlanner
  );

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

async function loop() {
  try {
    await runOnce();
  } catch (error) {
    console.error("[sync-error]", error);
  } finally {
    setTimeout(loop, env.pollIntervalMs);
  }
}

void loop();