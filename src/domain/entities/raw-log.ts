export type RawLog = {
  chainId: number;
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  logIndex: number;
  contractAddress: string;
  topics: string[];
  data: string;
  removed: boolean;
};