export type GetTransfersInput = {
  chainId: number;
  contractAddress?: string;
  address?: string;
  fromBlock?: number;
  toBlock?: number;
  limit?: number;
  cursor?: {
    blockNumber: number;
    logIndex: number;
  };
};

