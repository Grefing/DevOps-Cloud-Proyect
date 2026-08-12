import { Router, Request, Response } from "express";
import {
  createService,
  deleteService,
  findAllServices,
  findServiceById,
  updateService,
} from "../repositories/serviceRepository";
import {
  CreateServiceInput,
  ServiceStatus,
  UpdateServiceInput,
  VALID_STATUSES,
} from "../types/service";

const router = Router();

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function parseStatus(value: unknown): ServiceStatus | null {
  if (typeof value !== "string") {
    return null;
  }
  return VALID_STATUSES.includes(value as ServiceStatus)
    ? (value as ServiceStatus)
    : null;
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    const services = await findAllServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch services",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid service id" });
    return;
  }

  try {
    const service = await findServiceById(id);
    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch service",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { name, url, status } = req.body as CreateServiceInput;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  if (!url || typeof url !== "string" || !isValidUrl(url)) {
    res.status(400).json({ error: "url must be a valid URL" });
    return;
  }

  let parsedStatus: ServiceStatus | undefined;
  if (status !== undefined) {
    const maybeStatus = parseStatus(status);
    if (!maybeStatus) {
      res.status(400).json({
        error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
      return;
    }
    parsedStatus = maybeStatus;
  }

  try {
    const service = await createService({
      name: name.trim(),
      url: url.trim(),
      status: parsedStatus,
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({
      error: "Failed to create service",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid service id" });
    return;
  }

  const { name, url, status } = req.body as UpdateServiceInput;

  if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
    res.status(400).json({ error: "name cannot be empty" });
    return;
  }

  if (url !== undefined && (typeof url !== "string" || !isValidUrl(url))) {
    res.status(400).json({ error: "url must be a valid URL" });
    return;
  }

  let parsedStatus: ServiceStatus | undefined;
  if (status !== undefined) {
    const maybeStatus = parseStatus(status);
    if (!maybeStatus) {
      res.status(400).json({
        error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
      return;
    }
    parsedStatus = maybeStatus;
  }

  try {
    const service = await updateService(id, {
      name: name?.trim(),
      url: url?.trim(),
      status: parsedStatus,
    });

    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({
      error: "Failed to update service",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid service id" });
    return;
  }

  try {
    const deleted = await deleteService(id);
    if (!deleted) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete service",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
