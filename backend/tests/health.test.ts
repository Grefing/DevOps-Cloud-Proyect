import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { checkDatabaseConnection } from "../src/db/pool";

vi.mock("../src/db/pool", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/db/pool")>();
  return {
    ...actual,
    checkDatabaseConnection: vi.fn(),
  };
});

const mockedCheckDb = vi.mocked(checkDatabaseConnection);

describe("Health endpoint", () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 and ok status when database is connected", async () => {
    mockedCheckDb.mockResolvedValue(true);

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.database).toBe("connected");
    expect(response.body.uptime_seconds).toBeTypeOf("number");
    expect(response.body.timestamp).toBeTypeOf("string");
  });

  it("returns 503 and degraded status when database is disconnected", async () => {
    mockedCheckDb.mockResolvedValue(false);

    const response = await request(app).get("/health");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("degraded");
    expect(response.body.database).toBe("disconnected");
  });
});
