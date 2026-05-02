export type SyncWorkerRuntime = {
  pollIntervalMs: number;
  runOnce(): Promise<void>;
  shutdown(): Promise<void>;
};

export function startSyncWorker(runtime: SyncWorkerRuntime): void {
  async function loop(): Promise<void> {
    try {
      await runtime.runOnce();
    } catch (error) {
      console.error("[sync-error]", error);
    } finally {
      setTimeout(() => {
        void loop();
      }, runtime.pollIntervalMs);
    }
  }

  process.on("SIGINT", async () => {
    console.log("[shutdown] SIGINT received");
    await runtime.shutdown();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("[shutdown] SIGTERM received");
    await runtime.shutdown();
    process.exit(0);
  });

  void loop();
}
