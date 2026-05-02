import type { Request, Response } from "express";
import { CheckReadinessUseCase } from "../../../../application/use-cases/health/check-readiness.use-case";

export class HealthController {
  constructor(
    private readonly checkReadinessUseCase: CheckReadinessUseCase
  ) {}


  getLiveness(_req: Request, res: Response): void {
    res.status(200).json({
      status: "alive",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }

  async getReadiness(_req: Request, res: Response): Promise<void> {
    const result = await this.checkReadinessUseCase.execute();

    res.status(result.status === "ready" ? 200 : 503).json(result);
  }
}