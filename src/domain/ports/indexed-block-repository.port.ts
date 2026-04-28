import type { IndexedBlock } from "../entities";

export interface IndexedBlockRepositoryPort {

  saveMany(blocks: IndexedBlock[]): Promise<void>;

  findByBlockNumber(params: {   chainId: number;   blockNumber: number;  }): Promise<IndexedBlock | null>;

  deleteFromBlock(params: {   chainId: number;   fromBlock: number;  }): Promise<void>;
  
}