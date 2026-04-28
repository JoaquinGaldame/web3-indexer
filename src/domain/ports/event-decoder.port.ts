import type { Erc20Transfer, RawLog } from "../entities";

export interface EventDecoderPort {

  decodeErc20Transfer(log: RawLog): Erc20Transfer | null;
  
}