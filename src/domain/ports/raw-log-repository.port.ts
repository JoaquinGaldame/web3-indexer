import type { RawLog } from "../entities";

export interface RawLogRepositoryPort {
  saveMany(logs: RawLog[]): Promise<void>;

  markRemovedFromBlock(params: {   chainId: number;   contractAddress: string;   fromBlock: number;  }): Promise<void>;
}