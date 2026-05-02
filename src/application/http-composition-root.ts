import { createHttpServer } from "../interfaces/http/server";
import { createHttpRouter } from "../interfaces/http/router";

import { createHealthRouter } from "../interfaces/http/modules/health/health.routes";
import { createTransfersRouter } from "../interfaces/http/modules/transfers/transfers.routes";
import { TransfersController } from "../interfaces/http/modules/transfers/transfers.controllers";

import { GetTransfersUseCase } from "./use-cases/transfer/get-transfers.use-case";
import { DrizzleErc20TransferRepository } from "../infraestructure/db/repositories";
import { HealthController } from "../interfaces/http/modules/health/health.controller";

// Healthy
import { DatabaseHealthRepository } from "../infraestructure/db/repositories/health/health.repository";
import { CheckReadinessUseCase } from "./use-cases/health/check-readiness.use-case";




export function createHttpApp() {
  const erc20TransferRepository = new DrizzleErc20TransferRepository();
  const dbHealthRepo = new DatabaseHealthRepository();
  
  const getTransfersUseCase = new GetTransfersUseCase(
    erc20TransferRepository
  );

  const transfersController = new TransfersController(
    getTransfersUseCase
  );

  const checkReadinessUseCase = new CheckReadinessUseCase(dbHealthRepo);

  const healthController = new HealthController(checkReadinessUseCase);
  
  const healthRouter = createHealthRouter(healthController);

  const transfersRouter = createTransfersRouter(
    transfersController
  );


  const httpRouter = createHttpRouter({
    healthRouter,
    transfersRouter,
  });

  return createHttpServer(httpRouter);
}