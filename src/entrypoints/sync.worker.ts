import { createSyncWorker } from "#bootstrap/worker/create-sync-worker";
import { startSyncWorker } from "#interfaces/workers/sync-runner";

const worker = createSyncWorker();

startSyncWorker(worker);
