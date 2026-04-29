import { and, asc, eq, gte, lte, or, sql } from "drizzle-orm";

import { db } from "../client";
import { erc20Transfers } from "../schema";
import type { Erc20TransferRepositoryPort } from "../../../domain/ports";
import type { Erc20Transfer } from "../../../domain/entities";

export class DrizzleErc20TransferRepository
  implements Erc20TransferRepositoryPort
{
  async saveMany(transfers: Erc20Transfer[]): Promise<void> {
    if (transfers.length === 0) return;

    await db
      .insert(erc20Transfers)
      .values(
        transfers.map((transfer) => ({
          chainId: transfer.chainId,
          contractAddress: transfer.contractAddress,
          blockNumber: transfer.blockNumber,
          blockHash: transfer.blockHash,
          transactionHash: transfer.transactionHash,
          logIndex: transfer.logIndex,
          fromAddress: transfer.from,
          toAddress: transfer.to,
          value: transfer.value,
        }))
      )
      .onConflictDoNothing();
  }

  async deleteFromBlock(params: {
    chainId: number;
    contractAddress: string;
    fromBlock: number;
  }): Promise<void> {
    await db
      .delete(erc20Transfers)
      .where(
        and(
          eq(erc20Transfers.chainId, params.chainId),
          eq(erc20Transfers.contractAddress, params.contractAddress),
          gte(erc20Transfers.blockNumber, params.fromBlock)
        )
      );
  }

  async findMany(params: {
    chainId: number;
    contractAddress?: string;
    address?: string;
    fromBlock?: number;
    toBlock?: number;
    limit: number;
    cursor?: {
      blockNumber: number;
      logIndex: number;
    };
  }): Promise<Erc20Transfer[]> {
    const filters = [
      eq(erc20Transfers.chainId, params.chainId),
      params.contractAddress
        ? eq(erc20Transfers.contractAddress, params.contractAddress)
        : undefined,
      params.address
        ? or(
            eq(erc20Transfers.fromAddress, params.address),
            eq(erc20Transfers.toAddress, params.address)
          )
        : undefined,
      params.fromBlock
        ? gte(erc20Transfers.blockNumber, params.fromBlock)
        : undefined,
      params.toBlock ? lte(erc20Transfers.blockNumber, params.toBlock) : undefined,
      params.cursor
        ? sql`(${erc20Transfers.blockNumber}, ${erc20Transfers.logIndex}) > (${params.cursor.blockNumber}, ${params.cursor.logIndex})`
        : undefined,
    ].filter(Boolean);

    const rows = await db
      .select()
      .from(erc20Transfers)
      .where(and(...filters))
      .orderBy(asc(erc20Transfers.blockNumber), asc(erc20Transfers.logIndex))
      .limit(params.limit);

    return rows.map((row) => ({
      chainId: row.chainId,
      contractAddress: row.contractAddress,
      blockNumber: row.blockNumber,
      blockHash: row.blockHash,
      transactionHash: row.transactionHash,
      logIndex: row.logIndex,
      from: row.fromAddress,
      to: row.toAddress,
      value: row.value,
    }));
  }
}