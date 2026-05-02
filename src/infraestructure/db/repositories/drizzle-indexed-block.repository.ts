import { and, eq, gte } from "drizzle-orm";
import { db } from "#infraestructure/db/client";
import { indexedBlocks } from "#infraestructure/db/schema";
import type { IndexedBlockRepositoryPort } from "#domain/ports";
import type { IndexedBlock } from "#domain/entities";

export class DrizzleIndexedBlockRepository
  implements IndexedBlockRepositoryPort
{
  async saveMany(blocks: IndexedBlock[]): Promise<void> {
    if (blocks.length === 0) return;

    await db
      .insert(indexedBlocks)
      .values(blocks)
      .onConflictDoUpdate({
        target: [indexedBlocks.chainId, indexedBlocks.blockNumber],
        set: {
          blockHash: indexedBlocks.blockHash,
          parentHash: indexedBlocks.parentHash,
          indexedAt: new Date(),
        },
      });
  }

  async findByBlockNumber(params: {
    chainId: number;
    blockNumber: number;
  }): Promise<IndexedBlock | null> {
    const rows = await db
      .select()
      .from(indexedBlocks)
      .where(
        and(
          eq(indexedBlocks.chainId, params.chainId),
          eq(indexedBlocks.blockNumber, params.blockNumber)
        )
      )
      .limit(1);

    return rows[0] ?? null;
  }

  async deleteFromBlock(params: {
    chainId: number;
    fromBlock: number;
  }): Promise<void> {
    await db
      .delete(indexedBlocks)
      .where(
        and(
          eq(indexedBlocks.chainId, params.chainId),
          gte(indexedBlocks.blockNumber, params.fromBlock)
        )
      );
  }
}
