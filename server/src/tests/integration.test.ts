import assert from "node:assert";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { app } from "../server.js";

describe("Integration Test Suite", () => {
  let server: Server;
  let baseUrl: string;

  before((_ctx, done) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (address && typeof address === "object") {
        baseUrl = `http://localhost:${address.port}`;
        done();
      } else {
        done(new Error("Failed to retrieve server address."));
      }
    });
  });

  after((_ctx, done) => {
    server.close(done);
  });

  async function getCsrfHeaders() {
    const res = await fetch(`${baseUrl}/api/csrf`);
    const setCookie = res.headers.get("set-cookie");
    const body = (await res.json()) as any;
    const csrfToken = body.data.csrfToken as string;
    const cookie = setCookie ? setCookie.split(";")[0] : "";
    return {
      cookie,
      csrfToken
    };
  }

  describe("Health & Readiness checks", () => {
    it("should return 200 and OK for /healthz liveness probe", async () => {
      const res = await fetch(`${baseUrl}/healthz`);
      assert.strictEqual(res.status, 200);
      const body = (await res.json()) as any;
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.status, "OK");
      assert.ok(body.requestId);
    });

    it("should return 200 and READY for /readyz readiness probe", async () => {
      const res = await fetch(`${baseUrl}/readyz`);
      assert.strictEqual(res.status, 200);
      const body = (await res.json()) as any;
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.status, "READY");
      assert.strictEqual(body.data.database, "UP");
      assert.ok(body.requestId);
    });
  });

  describe("CSRF Protection", () => {
    it("should return 200 and a new CSRF token from /api/csrf", async () => {
      const res = await fetch(`${baseUrl}/api/csrf`);
      assert.strictEqual(res.status, 200);
      const body = (await res.json()) as any;
      assert.strictEqual(body.success, true);
      assert.ok(body.data.csrfToken);
      assert.ok(body.requestId);
    });
  });

  describe("Authentication, Validation & Authorization", () => {
    it("should return 422 validation error for /api/auth/login when payload is invalid", async () => {
      const { cookie, csrfToken } = await getCsrfHeaders();
      const headers = new Headers();
      headers.set("Content-Type", "application/json");
      if (csrfToken) headers.set("x-csrf-token", csrfToken);
      if (cookie) headers.set("Cookie", cookie);

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email: "invalid-email" })
      });
      assert.strictEqual(res.status, 422);
      const body = (await res.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.code, "VALIDATION_ERROR");
      assert.ok(body.requestId);
    });

    it("should return 401 unauthorized for /api/auth/login when credentials are wrong", async () => {
      const { cookie, csrfToken } = await getCsrfHeaders();
      const headers = new Headers();
      headers.set("Content-Type", "application/json");
      if (csrfToken) headers.set("x-csrf-token", csrfToken);
      if (cookie) headers.set("Cookie", cookie);

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email: "admin@uprise.com", password: "wrong-password-long-enough" })
      });
      assert.strictEqual(res.status, 401);
      const body = (await res.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.code, "UNAUTHORIZED");
      assert.ok(body.requestId);
    });

    it("should login successfully with correct credentials and return tokens", async () => {
      const { cookie, csrfToken } = await getCsrfHeaders();
      const headers = new Headers();
      headers.set("Content-Type", "application/json");
      if (csrfToken) headers.set("x-csrf-token", csrfToken);
      if (cookie) headers.set("Cookie", cookie);

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email: "admin@uprise.com", password: "password123" })
      });
      assert.strictEqual(res.status, 200);
      const body = (await res.json()) as any;
      assert.strictEqual(body.success, true);
      assert.ok(body.data.accessToken);
      assert.ok(body.data.refreshToken);
      assert.strictEqual(body.data.user.email, "admin@uprise.com");
      assert.strictEqual(body.data.user.role, "ADMIN");
      assert.ok(body.requestId);
    });

    it("should return 401 unauthorized for protected admin endpoints if unauthenticated", async () => {
      const res = await fetch(`${baseUrl}/api/admin/dashboard`);
      assert.strictEqual(res.status, 401);
      const body = (await res.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.code, "UNAUTHORIZED");
      assert.ok(body.requestId);
    });
  });

  describe("Rate Limiting", () => {
    it("should trigger rate limiter after 10 auth requests to /api/auth/login", async () => {
      let triggered = false;
      const { cookie, csrfToken } = await getCsrfHeaders();
      const headers = new Headers();
      headers.set("Content-Type", "application/json");
      if (csrfToken) headers.set("x-csrf-token", csrfToken);
      if (cookie) headers.set("Cookie", cookie);

      for (let i = 0; i < 15; i++) {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
          method: "POST",
          headers,
          body: JSON.stringify({ email: "rate-limited@uprise.com", password: "wrong-password-long-enough" })
        });
        if (res.status === 429) {
          triggered = true;
          const body = (await res.json()) as any;
          assert.strictEqual(body.success, false);
          assert.strictEqual(body.code, "TOO_MANY_REQUESTS");
          break;
        }
      }
      assert.ok(triggered, "Rate limiter did not trigger for login endpoint.");
    });
  });
});
