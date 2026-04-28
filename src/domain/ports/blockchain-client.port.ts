import type { IndexedBlock, RawLog } from "../entities";

export type GetLogsParams = {
  contractAddress: string;
  fromBlock: number;
  toBlock: number;
  topics?: string[];
};

export interface BlockchainClientPort {
  getLatestBlockNumber(): Promise<number>;

  getBlock(blockNumber: number): Promise<IndexedBlock>;

  getLogs(params: GetLogsParams): Promise<RawLog[]>;
}