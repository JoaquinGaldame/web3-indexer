import type { Checkpoint } from "../entities";

export type CheckpointKey = {
  chainId: number;
  contractAddress: string;
  eventName: string;
};

export interface CheckpointRepositoryPort {

  findByKey(key: CheckpointKey): Promise<Checkpoint | null>;

  createInitial(key: CheckpointKey, startBlock: number): Promise<Checkpoint>;

  updateProgress(params: {   key: CheckpointKey;   lastProcessedBlock: number;   lastSafeBlock: number;  }): Promise<void>;
  
}