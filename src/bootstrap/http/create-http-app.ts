import { CheckReadinessUseCase } from "#application/use-cases/health/check-readiness.use-case";
import { GetTransfersUseCase } from "#application/use-cases/transfer/get-transfers.use-case";
import { DatabaseHealthRepository } from "#infraestructure/db/repositories/health/health.repository";
import { DrizzleErc20TransferRepository } from "#infraestructure/db/repositories";
import { HealthController } from "#interfaces/http/modules/health/health.controller";
import { createHealthRouter } from "#interfaces/http/modules/health/health.routes";
import { TransfersController } from "#interfaces/http/modules/transfers/transfers.controllers";
import { createTransfersRouter } from "#interfaces/http/modules/transfers/transfers.routes";
import { createHttpRouter } from "#interfaces/http/router";
import { createHttpServer } from "#interfaces/http/server";

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
  const transfersRouter = createTransfersRouter(transfersController);

  const httpRouter = createHttpRouter({
    healthRouter,
    transfersRouter,
  });

  return createHttpServer(httpRouter);
}
