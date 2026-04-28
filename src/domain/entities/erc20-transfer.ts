export type Erc20Transfer = {
  chainId: number;
  contractAddress: string;
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  logIndex: number;
  from: string;
  to: string;
  value: string;
};