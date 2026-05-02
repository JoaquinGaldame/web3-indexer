import type { Request, Response } from "express";
import { GetTransfersUseCase } from "../../../../application/use-cases/transfer/get-transfers.use-case";
import { GetTransfersInput } from "../../../../application/dtos/transfers/tranfers.interface";


export class TransfersController {
  constructor(private readonly getTransfersUseCase: GetTransfersUseCase) {}

  async getTransfers(req: Request, res: Response): Promise<void> {
    const chainId = Number(req.query.chainId);

    if (!Number.isInteger(chainId)) {
      res.status(400).json({
        error: "chainId is required and must be a valid integer",
      });
      return;
    }

    const input: GetTransfersInput = {
      chainId,
    };

    if (typeof req.query.contractAddress === "string") {
      input.contractAddress = req.query.contractAddress;
    }

    if (typeof req.query.address === "string") {
      input.address = req.query.address;
    }

    if (typeof req.query.fromBlock === "string") {
      const fromBlock = Number(req.query.fromBlock);

      if (!Number.isInteger(fromBlock)) {
        res.status(400).json({
          error: "fromBlock must be a valid integer",
        });
        return;
      }

      input.fromBlock = fromBlock;
    }

    if (typeof req.query.toBlock === "string") {
      const toBlock = Number(req.query.toBlock);

      if (!Number.isInteger(toBlock)) {
        res.status(400).json({
          error: "toBlock must be a valid integer",
        });
        return;
      }

      input.toBlock = toBlock;
    }

    if (typeof req.query.limit === "string") {
      const limit = Number(req.query.limit);

      if (!Number.isInteger(limit) || limit <= 0) {
        res.status(400).json({
          error: "limit must be a positive integer",
        });
        return;
      }

      input.limit = limit;
    }

    if (
      typeof req.query.cursorBlockNumber === "string" ||
      typeof req.query.cursorLogIndex === "string"
    ) {
      if (
        typeof req.query.cursorBlockNumber !== "string" ||
        typeof req.query.cursorLogIndex !== "string"
      ) {
        res.status(400).json({
          error:
            "cursorBlockNumber and cursorLogIndex must be provided together",
        });
        return;
      }

      const blockNumber = Number(req.query.cursorBlockNumber);
      const logIndex = Number(req.query.cursorLogIndex);

      if (!Number.isInteger(blockNumber) || !Number.isInteger(logIndex)) {
        res.status(400).json({
          error: "cursorBlockNumber and cursorLogIndex must be valid integers",
        });
        return;
      }

      input.cursor = {
        blockNumber,
        logIndex,
      };
    }

    const transfers = await this.getTransfersUseCase.execute(input);

    res.status(200).json({
      data: transfers,
    });
  }
}