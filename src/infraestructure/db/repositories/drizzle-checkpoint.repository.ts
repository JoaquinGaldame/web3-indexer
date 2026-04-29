import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { indexerCheckpoints } from "../schema";
import type { CheckpointKey, CheckpointRepositoryPort } from "../../../domain/ports";
import type { Checkpoint } from "../../../domain/entities";

export class DrizzleCheckpointRepository implements CheckpointRepositoryPort {


  async findByKey(key: CheckpointKey): Promise<Checkpoint | null> {
    const rows = await db
      .select()
      .from(indexerCheckpoints)
      .where(
        and(
          eq(indexerCheckpoints.chainId, key.chainId),
          eq(indexerCheckpoints.contractAddress, key.contractAddress),
          eq(indexerCheckpoints.eventName, key.eventName)
        )
      )
      .limit(1);

    return rows[0] ?? null;
  }


  async createInitial(
    key: CheckpointKey,
    startBlock: number
  ): Promise<Checkpoint> {
    const initial: Checkpoint = {
      ...key,
      lastProcessedBlock: startBlock,
      lastSafeBlock: startBlock,
      updatedAt: new Date(),
    };

    await db
      .insert(indexerCheckpoints)
      .values(initial)
      .onConflictDoNothing();

    const checkpoint = await this.findByKey(key);

    if (!checkpoint) {
      throw new Error("Failed to create initial checkpoint");
    }

    return checkpoint;
  }


  async updateProgress(params: {
    key: CheckpointKey;
    lastProcessedBlock: number;
    lastSafeBlock: number;
  }): Promise<void> {
    await db
      .update(indexerCheckpoints)
      .set({
        lastProcessedBlock: params.lastProcessedBlock,
        lastSafeBlock: params.lastSafeBlock,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(indexerCheckpoints.chainId, params.key.chainId),
          eq(indexerCheckpoints.contractAddress, params.key.contractAddress),
          eq(indexerCheckpoints.eventName, params.key.eventName)
        )
      );
  }
}