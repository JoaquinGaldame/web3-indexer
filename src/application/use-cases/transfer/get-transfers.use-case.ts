import type { Erc20Transfer } from "../../../domain/entities";
import type { Erc20TransferRepositoryPort } from "../../../domain/ports";
import { GetTransfersInput } from "../../dtos/transfers/tranfers.interface";


export class GetTransfersUseCase {
  constructor(
    private readonly erc20TransferRepository: Erc20TransferRepositoryPort
  ) {}

  async execute(input: GetTransfersInput): Promise<Erc20Transfer[]> {
    const limit = Math.min(input.limit ?? 50, 100);

    const params: Parameters<Erc20TransferRepositoryPort["findMany"]>[0] = {
      chainId: input.chainId,
      limit,
    };

    if (input.contractAddress !== undefined) {
      params.contractAddress = input.contractAddress;
    }

    if (input.address !== undefined) {
      params.address = input.address;
    }

    if (input.fromBlock !== undefined) {
      params.fromBlock = input.fromBlock;
    }

    if (input.toBlock !== undefined) {
      params.toBlock = input.toBlock;
    }

    if (input.cursor !== undefined) {
      params.cursor = input.cursor;
    }

    return this.erc20TransferRepository.findMany(params);
  }
}