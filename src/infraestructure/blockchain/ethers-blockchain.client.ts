import { JsonRpcProvider } from "ethers";
import type { Filter } from "ethers";

import type { BlockchainClientPort, GetLogsParams } from "../../domain/ports";
import type { IndexedBlock, RawLog } from "../../domain/entities";

export class EthersBlockchainClient implements BlockchainClientPort {
  private readonly provider: JsonRpcProvider;
  private readonly chainId: number;

  constructor(params: { rpcUrl: string; chainId: number }) {
    this.provider = new JsonRpcProvider(params.rpcUrl);
    this.chainId = params.chainId;
  }

  async getLatestBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getBlock(blockNumber: number): Promise<IndexedBlock> {
    const block = await this.provider.getBlock(blockNumber);

    if (!block) {
      throw new Error(`Block not found: ${blockNumber}`);
    }

    return {
      chainId: this.chainId,
      blockNumber: block.number,
      blockHash: block.hash ?? "",
      parentHash: block.parentHash,
    };
  }

  async getLogs(params: GetLogsParams): Promise<RawLog[]> {

    const filter: Filter = {
      address: params.contractAddress,
      fromBlock: params.fromBlock,
      toBlock: params.toBlock,
    };

    if (params.topics) {
      filter.topics = params.topics;
    }
    
    const logs = await this.provider.getLogs(filter);

    return logs.map((log) => {
      if (!log.blockHash) {
        throw new Error(
          `Log without blockHash. tx=${log.transactionHash}, index=${log.index}`
        );
      }

      return {
        chainId: this.chainId,
        blockNumber: log.blockNumber,
        blockHash: log.blockHash,
        transactionHash: log.transactionHash,
        logIndex: log.index,
        contractAddress: log.address,
        topics: [...log.topics],
        data: log.data,
        removed: log.removed ?? false,
      };
    });
  }
}