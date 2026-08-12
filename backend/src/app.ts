import express from "express";
import cors from "cors";
import healthRouter from "./routes/health";
import metricsRouter from "./routes/metrics";
import servicesRouter from "./routes/services";
import { metricsMiddleware } from "./middleware/metrics";

export function createApp(): express.Application {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(metricsMiddleware);

  app.use("/health", healthRouter);
  app.use("/metrics", metricsRouter);
  app.use("/api/services", servicesRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}
