import type { Erc20Transfer } from "../entities";

export interface Erc20TransferRepositoryPort {

  saveMany(transfers: Erc20Transfer[]): Promise<void>;

  deleteFromBlock(params: {   chainId: number;   contractAddress: string;   fromBlock: number;  }): Promise<void>;

  findMany(params: {   chainId: number;   contractAddress?: string;   address?: string;   fromBlock?: number;   toBlock?: number;    limit: number;    cursor?: {     blockNumber: number;     logIndex: number;    };  }): Promise<Erc20Transfer[]>;
  
}