import express from "express";
import cors from "cors";
import helmet from "helmet";
import type { Router } from "express";

export function createHttpServer(httpRouter: Router) {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use(httpRouter);

  return app;
}