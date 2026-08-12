import { Router, Request, Response } from "express";
import { checkDatabaseConnection } from "../db/pool";

const router = Router();
const startTime = Date.now();

router.get("/", (_req: Request, res: Response) => {
  void (async () => {
    const dbConnected = await checkDatabaseConnection();

    const payload = {
      status: dbConnected ? "ok" : "degraded",
      database: dbConnected ? "connected" : "disconnected",
      uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    };

    res.status(dbConnected ? 200 : 503).json(payload);
  })();
});

export default router;
