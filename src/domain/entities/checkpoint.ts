export type Checkpoint = {
  chainId: number;
  contractAddress: string;
  eventName: string;
  lastProcessedBlock: number;
  lastSafeBlock: number;
  updatedAt: Date;
};