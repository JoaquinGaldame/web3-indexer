import { Interface } from "ethers";

import type { EventDecoderPort } from "../../domain/ports";
import type { Erc20Transfer, RawLog } from "../../domain/entities";

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

export class EthersEventDecoder implements EventDecoderPort {
  private readonly iface = new Interface(ERC20_ABI);

  decodeErc20Transfer(log: RawLog): Erc20Transfer | null {
    try {
      const parsed = this.iface.parseLog({
        topics: log.topics,
        data: log.data,
      });

      if (!parsed || parsed.name !== "Transfer") {
        return null;
      }

      return {
        chainId: log.chainId,
        contractAddress: log.contractAddress,
        blockNumber: log.blockNumber,
        blockHash: log.blockHash,
        transactionHash: log.transactionHash,
        logIndex: log.logIndex,
        from: parsed.args.from,
        to: parsed.args.to,
        value: parsed.args.value.toString(),
      };
    } catch {
      return null;
    }
  }
}