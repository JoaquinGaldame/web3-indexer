import { and, eq, gte } from "drizzle-orm";
import { db } from "#infraestructure/db/client";
import { rawLogs } from "#infraestructure/db/schema";
import type { RawLogRepositoryPort } from "#domain/ports";
import type { RawLog } from "#domain/entities";

export class DrizzleRawLogRepository implements RawLogRepositoryPort {


  async saveMany(logs: RawLog[]): Promise<void> {
    if (logs.length === 0) return;

    await db
      .insert(rawLogs)
      .values(logs)
      .onConflictDoNothing();
  }

  async markRemovedFromBlock(params: {
    chainId: number;
    contractAddress: string;
    fromBlock: number;
  }): Promise<void> {
    await db
      .update(rawLogs)
      .set({ removed: true })
      .where(
        and(
          eq(rawLogs.chainId, params.chainId),
          eq(rawLogs.contractAddress, params.contractAddress),
          gte(rawLogs.blockNumber, params.fromBlock)
        )
      );
  }
}
