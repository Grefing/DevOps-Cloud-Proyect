import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import * as serviceRepository from "../src/repositories/serviceRepository";
import { Service } from "../src/types/service";

vi.mock("../src/repositories/serviceRepository");

const mockedRepo = vi.mocked(serviceRepository);

const sampleService: Service = {
  id: 1,
  name: "API Gateway",
  url: "https://api.example.com",
  status: "healthy",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("Services CRUD", () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/services", () => {
    it("returns all services", async () => {
      mockedRepo.findAllServices.mockResolvedValue([sampleService]);

      const response = await request(app).get("/api/services");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe("API Gateway");
    });
  });

  describe("GET /api/services/:id", () => {
    it("returns a service by id", async () => {
      mockedRepo.findServiceById.mockResolvedValue(sampleService);

      const response = await request(app).get("/api/services/1");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
    });

    it("returns 404 when service does not exist", async () => {
      mockedRepo.findServiceById.mockResolvedValue(null);

      const response = await request(app).get("/api/services/99");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Service not found");
    });

    it("returns 400 for invalid id", async () => {
      const response = await request(app).get("/api/services/abc");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid service id");
    });
  });

  describe("POST /api/services", () => {
    it("creates a new service", async () => {
      mockedRepo.createService.mockResolvedValue(sampleService);

      const response = await request(app)
        .post("/api/services")
        .send({
          name: "API Gateway",
          url: "https://api.example.com",
          status: "healthy",
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("API Gateway");
      expect(mockedRepo.createService).toHaveBeenCalledWith({
        name: "API Gateway",
        url: "https://api.example.com",
        status: "healthy",
      });
    });

    it("returns 400 when name is missing", async () => {
      const response = await request(app)
        .post("/api/services")
        .send({ url: "https://api.example.com" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("name is required");
    });

    it("returns 400 when url is invalid", async () => {
      const response = await request(app)
        .post("/api/services")
        .send({ name: "Test", url: "not-a-url" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("url must be a valid URL");
    });
  });

  describe("PUT /api/services/:id", () => {
    it("updates an existing service", async () => {
      const updated: Service = { ...sampleService, status: "down" };
      mockedRepo.updateService.mockResolvedValue(updated);

      const response = await request(app)
        .put("/api/services/1")
        .send({ status: "down" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("down");
    });

    it("returns 404 when updating non-existent service", async () => {
      mockedRepo.updateService.mockResolvedValue(null);

      const response = await request(app)
        .put("/api/services/99")
        .send({ status: "down" });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/services/:id", () => {
    it("deletes an existing service", async () => {
      mockedRepo.deleteService.mockResolvedValue(true);

      const response = await request(app).delete("/api/services/1");

      expect(response.status).toBe(204);
    });

    it("returns 404 when deleting non-existent service", async () => {
      mockedRepo.deleteService.mockResolvedValue(false);

      const response = await request(app).delete("/api/services/99");

      expect(response.status).toBe(404);
    });
  });
});
