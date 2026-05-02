import { Router } from "express";
import { TransfersController } from "./transfers.controllers";


export function createTransfersRouter(
  transfersController: TransfersController
): Router {
  const router = Router();

  router.get("/", (req, res) => {
    void transfersController.getTransfers(req, res);
  });

  return router;
}