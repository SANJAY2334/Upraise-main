import assert from "node:assert";
import { describe, it } from "node:test";
import type { Request, Response } from "express";
import { AuthController } from "../../controllers/auth.controller.js";
import { AuthService } from "../../services/auth.service.js";

const mockLoginDTO = {
  accessToken: "access-token-123",
  refreshToken: "refresh-token-123",
  user: {
    id: "user-123",
    email: "jane@example.com",
    role: "ADMIN"
  }
};

class DummyAuthService extends AuthService {
  constructor() {
    super(null as any, null as any);
  }
  override async login() {
    return mockLoginDTO;
  }
  override async refresh() {
    return { accessToken: "new-access-token" };
  }
  override async logout() {
    // Stub
  }
}

describe("AuthController Unit Tests", () => {
  it("should login and set up refresh token cookie", async () => {
    const dummyService = new DummyAuthService();
    const controller = new AuthController(dummyService);

    let resData: any = null;
    let cookieName: string | null = null;
    let cookieVal: string | null = null;
    let cookieOpts: any = null;

    const req = {
      id: "req-1",
      body: { email: "jane@example.com", password: "password123" }
    } as unknown as Request;

    const res = {
      cookie(name: string, val: string, opts: any) {
        cookieName = name;
        cookieVal = val;
        cookieOpts = opts;
        return this;
      },
      json(data: any) {
        resData = data;
        return this;
      }
    } as unknown as Response;

    await controller.login(req, res, () => {});

    assert.ok(resData);
    assert.strictEqual(resData.success, true);
    assert.strictEqual(resData.requestId, "req-1");
    assert.strictEqual(resData.data.accessToken, "access-token-123");

    assert.strictEqual(cookieName, "uprise_refresh_token");
    assert.strictEqual(cookieVal, "refresh-token-123");
    assert.ok(cookieOpts.httpOnly);
    assert.strictEqual(cookieOpts.path, "/api/auth");
  });

  it("should refresh access token from cookies", async () => {
    const dummyService = new DummyAuthService();
    const controller = new AuthController(dummyService);

    let resData: any = null;
    const req = {
      id: "req-2",
      cookies: { uprise_refresh_token: "refresh-token-123" }
    } as unknown as Request;

    const res = {
      json(data: any) {
        resData = data;
        return this;
      }
    } as unknown as Response;

    await controller.refresh(req, res, () => {});

    assert.ok(resData);
    assert.strictEqual(resData.success, true);
    assert.strictEqual(resData.data.accessToken, "new-access-token");
  });

  it("should logout and clear refresh token cookie", async () => {
    const dummyService = new DummyAuthService();
    const controller = new AuthController(dummyService);

    let clearedCookieName: string | null = null;
    let clearedCookieOpts: any = null;
    let resData: any = null;

    const req = {
      id: "req-3",
      cookies: { uprise_refresh_token: "refresh-token-123" }
    } as unknown as Request;

    const res = {
      clearCookie(name: string, opts: any) {
        clearedCookieName = name;
        clearedCookieOpts = opts;
        return this;
      },
      json(data: any) {
        resData = data;
        return this;
      }
    } as unknown as Response;

    await controller.logout(req, res, () => {});

    assert.strictEqual(clearedCookieName, "uprise_refresh_token");
    assert.strictEqual(clearedCookieOpts.path, "/api/auth");
    assert.ok(resData);
    assert.strictEqual(resData.success, true);
    assert.strictEqual(resData.data.ok, true);
  });

  it("should return correct user details on me endpoint", async () => {
    const dummyService = new DummyAuthService();
    const controller = new AuthController(dummyService);

    let resData: any = null;
    const req = {
      id: "req-4",
      user: { id: "user-123", email: "jane@example.com", role: "ADMIN" }
    } as unknown as Request;

    const res = {
      json(data: any) {
        resData = data;
        return this;
      }
    } as unknown as Response;

    await controller.me(req, res, () => {});

    assert.ok(resData);
    assert.strictEqual(resData.success, true);
    assert.strictEqual(resData.data.user.email, "jane@example.com");
  });
});
