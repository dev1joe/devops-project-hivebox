import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./app"

describe("GET /", () => {
  it("return ok", async () => {
    const res = await request(app).get("/api");
    expect(res.status).toBe(200);
  });
});

describe("GET /info", () => {
  it("return ok", async () => {
    const res = await request(app).get("/api/info");
    expect(res.status).toBe(200);
  });
});

describe("GET /version", () => {
  it("return ok", async () => {
    const res = await request(app).get("/api/version");
    expect(res.status).toBe(200);
  });
});

describe("GET /temperature", () => {
  it("return ok", async () => {
    const res = await request(app).get("/api/temperature");
    expect(res.status).toBe(200);
  })
});

describe("GET /nobe", () => {
  it("return ok", async () => {
    const res = await request(app).get("/nobe");
    expect(res.status).toBe(404);
  });
});
