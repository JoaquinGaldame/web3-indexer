import type { BlockRange } from "../../domain/entities";

export type BlockRangePlannerInput = {
  lastProcessedBlock: number;
  safeBlock: number;
  batchSize: number;
};

export type BlockRangePlannerResult =
  | {
      shouldSync: true;
      range: BlockRange;
    }
  | {
      shouldSync: false;
      reason: "UP_TO_DATE";
    };

export class BlockRangePlanner {
  plan(input: BlockRangePlannerInput): BlockRangePlannerResult {
    const { lastProcessedBlock, safeBlock, batchSize } = input;

    if (batchSize <= 0) {
      throw new Error("batchSize must be greater than 0");
    }

    if (safeBlock < 0) {
      throw new Error("safeBlock cannot be negative");
    }

    if (lastProcessedBlock < 0) {
      throw new Error("lastProcessedBlock cannot be negative");
    }

    const fromBlock = lastProcessedBlock + 1;

    if (fromBlock > safeBlock) {
      return {
        shouldSync: false,
        reason: "UP_TO_DATE",
      };
    }

    const toBlock = Math.min(fromBlock + batchSize - 1, safeBlock);

    return {
      shouldSync: true,
      range: {
        fromBlock,
        toBlock,
      },
    };
  }
}