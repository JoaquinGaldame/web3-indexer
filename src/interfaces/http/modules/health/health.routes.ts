import { Router } from "express";
import type { HealthController } from "./health.controller";

export function createHealthRouter(
  healthController: HealthController
): Router {
  const router = Router();

  router.get("/live", healthController.getLiveness.bind(healthController));
  router.get("/ready", healthController.getReadiness.bind(healthController));

  return router;
}