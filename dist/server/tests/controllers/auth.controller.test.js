import assert from "node:assert";
import { describe, it } from "node:test";
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
        super(null, null);
    }
    async login() {
        return mockLoginDTO;
    }
    async refresh() {
        return { accessToken: "new-access-token" };
    }
    async logout() {
        // Stub
    }
}
describe("AuthController Unit Tests", () => {
    it("should login and set up refresh token cookie", async () => {
        const dummyService = new DummyAuthService();
        const controller = new AuthController(dummyService);
        let resData = null;
        let cookieName = null;
        let cookieVal = null;
        let cookieOpts = null;
        const req = {
            id: "req-1",
            body: { email: "jane@example.com", password: "password123" }
        };
        const res = {
            cookie(name, val, opts) {
                cookieName = name;
                cookieVal = val;
                cookieOpts = opts;
                return this;
            },
            json(data) {
                resData = data;
                return this;
            }
        };
        await controller.login(req, res, () => { });
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
        let resData = null;
        const req = {
            id: "req-2",
            cookies: { uprise_refresh_token: "refresh-token-123" }
        };
        const res = {
            json(data) {
                resData = data;
                return this;
            }
        };
        await controller.refresh(req, res, () => { });
        assert.ok(resData);
        assert.strictEqual(resData.success, true);
        assert.strictEqual(resData.data.accessToken, "new-access-token");
    });
    it("should logout and clear refresh token cookie", async () => {
        const dummyService = new DummyAuthService();
        const controller = new AuthController(dummyService);
        let clearedCookieName = null;
        let clearedCookieOpts = null;
        let resData = null;
        const req = {
            id: "req-3",
            cookies: { uprise_refresh_token: "refresh-token-123" }
        };
        const res = {
            clearCookie(name, opts) {
                clearedCookieName = name;
                clearedCookieOpts = opts;
                return this;
            },
            json(data) {
                resData = data;
                return this;
            }
        };
        await controller.logout(req, res, () => { });
        assert.strictEqual(clearedCookieName, "uprise_refresh_token");
        assert.strictEqual(clearedCookieOpts.path, "/api/auth");
        assert.ok(resData);
        assert.strictEqual(resData.success, true);
        assert.strictEqual(resData.data.ok, true);
    });
    it("should return correct user details on me endpoint", async () => {
        const dummyService = new DummyAuthService();
        const controller = new AuthController(dummyService);
        let resData = null;
        const req = {
            id: "req-4",
            user: { id: "user-123", email: "jane@example.com", role: "ADMIN" }
        };
        const res = {
            json(data) {
                resData = data;
                return this;
            }
        };
        await controller.me(req, res, () => { });
        assert.ok(resData);
        assert.strictEqual(resData.success, true);
        assert.strictEqual(resData.data.user.email, "jane@example.com");
    });
});
