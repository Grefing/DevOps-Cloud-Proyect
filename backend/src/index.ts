import { createApp } from "./app";
import { config } from "./config";
import { initializeDatabase } from "./db/init";

async function main(): Promise<void> {
  await initializeDatabase();

  const app = createApp();

  app.listen(config.port, () => {
    console.log(`OpsWatch API running on http://localhost:${config.port}`);
    console.log(`Health:  http://localhost:${config.port}/health`);
    console.log(`Metrics: http://localhost:${config.port}/metrics`);
  });
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
