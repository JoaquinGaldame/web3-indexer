import { Router } from "express";
import type { Router as ExpressRouter } from "express";

export function createHttpRouter(routers: {
  healthRouter: ExpressRouter;
  transfersRouter: ExpressRouter;
}): Router {
  const router = Router();

  router.use("/health", routers.healthRouter);
  router.use("/api/transfers", routers.transfersRouter);

  return router;
}