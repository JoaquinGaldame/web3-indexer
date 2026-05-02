import type {
  BlockchainClientPort,
  CheckpointRepositoryPort,
  RawLogRepositoryPort,
  IndexedBlockRepositoryPort,
  Erc20TransferRepositoryPort,
  EventDecoderPort,
  CheckpointKey,
} from "#domain/ports";

import type { Erc20Transfer, IndexedBlock, RawLog } from "#domain/entities";

import { BlockRangePlanner } from "#application/services/block-range-planner";


export type SyncContractEventsInput = {
  chainId: number;
  contractAddress: string;
  eventName: string;
  startBlock: number;
  confirmations: number;
  batchSize: number;
  topics?: string[];
};

export type SyncContractEventsResult =
  | {
      status: "SYNCED";
      fromBlock: number;
      toBlock: number;
      logsFound: number;
      transfersSaved: number;
      safeBlock: number;
    }
  | {
      status: "UP_TO_DATE";
      safeBlock: number;
      lastProcessedBlock: number;
    };

export class SyncContractEventsUseCase {
  constructor(
    private readonly blockchainClient: BlockchainClientPort,
    private readonly checkpointRepository: CheckpointRepositoryPort,
    private readonly rawLogRepository: RawLogRepositoryPort,
    private readonly indexedBlockRepository: IndexedBlockRepositoryPort,
    private readonly erc20TransferRepository: Erc20TransferRepositoryPort,
    private readonly eventDecoder: EventDecoderPort,
    private readonly blockRangePlanner: BlockRangePlanner
  ) {}

  async execute(input: SyncContractEventsInput): Promise<SyncContractEventsResult> {
    const key: CheckpointKey = {
      chainId: input.chainId,
      contractAddress: input.contractAddress,
      eventName: input.eventName,
    };

    const latestBlock = await this.blockchainClient.getLatestBlockNumber();
    const safeBlock = latestBlock - input.confirmations;

    let checkpoint = await this.checkpointRepository.findByKey(key);

    if (!checkpoint) {
      checkpoint = await this.checkpointRepository.createInitial(
        key,
        input.startBlock
      );
    }

    const plan = this.blockRangePlanner.plan({
      lastProcessedBlock: checkpoint.lastProcessedBlock,
      safeBlock,
      batchSize: input.batchSize,
    });

    if (!plan.shouldSync) {
      return {
        status: "UP_TO_DATE",
        safeBlock,
        lastProcessedBlock: checkpoint.lastProcessedBlock,
      };
    }

    const { fromBlock, toBlock } = plan.range;

    const logs = await this.blockchainClient.getLogs({
      contractAddress: input.contractAddress,
      fromBlock,
      toBlock,
      topics: input.topics ?? [],
    });

    const blocks = await this.getBlocksInRange(fromBlock, toBlock);

    await this.indexedBlockRepository.saveMany(blocks);
    await this.rawLogRepository.saveMany(logs);

    const transfers = logs
      .map((log) => this.eventDecoder.decodeErc20Transfer(log))
      .filter((transfer): transfer is Erc20Transfer => transfer !== null);

    await this.erc20TransferRepository.saveMany(transfers);

    await this.checkpointRepository.updateProgress({
      key,
      lastProcessedBlock: toBlock,
      lastSafeBlock: safeBlock,
    });

    return {
      status: "SYNCED",
      fromBlock,
      toBlock,
      logsFound: logs.length,
      transfersSaved: transfers.length,
      safeBlock,
    };
  }

  private async getBlocksInRange(
    fromBlock: number,
    toBlock: number
  ): Promise<IndexedBlock[]> {
    const blocks: IndexedBlock[] = [];

    for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
      const block = await this.blockchainClient.getBlock(blockNumber);
      blocks.push(block);
    }

    return blocks;
  }
}
