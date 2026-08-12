import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

describe("Metrics endpoint", () => {
  const app = createApp();

  it("returns prometheus metrics format", async () => {
    const response = await request(app).get("/metrics");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/plain");
    expect(response.text).toContain("http_requests_total");
    expect(response.text).toContain("http_request_duration_seconds");
  });

  it("increments http_requests_total after a request", async () => {
    await request(app).get("/health");

    const response = await request(app).get("/metrics");

    expect(response.text).toMatch(/http_requests_total/);
  });
});
