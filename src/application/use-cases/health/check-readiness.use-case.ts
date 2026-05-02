export class CheckReadinessUseCase {
  constructor(
    private readonly databaseHealthRepository: {
      isHealthy(): Promise<boolean>;
    }
  ) {}

  async execute() {
    const dbHealthy = await this.databaseHealthRepository.isHealthy();

    return {
      status: dbHealthy ? "ready" : "not_ready",
      checks: {
        database: dbHealthy ? "up" : "down",
      },
      timestamp: new Date().toISOString(),
    };
  }
}