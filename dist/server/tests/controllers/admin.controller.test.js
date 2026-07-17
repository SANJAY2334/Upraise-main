import assert from "node:assert";
import { describe, it } from "node:test";
import { AdminController } from "../../controllers/admin.controller.js";
import { AdminService } from "../../services/admin.service.js";
class DummyAdminService extends AdminService {
    constructor() {
        super(null, null);
    }
    async getDashboardData() {
        return {
            leads: 1,
            projects: 2,
            blogs: 3,
            mediaAssets: 4,
            services: 5,
            messages: 6
        };
    }
    async getLeads(params) {
        return {
            data: [{ id: "lead-1", status: params.status || "NEW" }],
            total: 1,
            page: params.page,
            limit: 20
        };
    }
    async updateLeadStatus(params) {
        return { id: params.id, status: params.status };
    }
    async createService(_params) {
        return { id: "svc-1", title: "Cloud Optimization" };
    }
}
describe("AdminController Unit Tests", () => {
    it("should get dashboard counts with standard payload", async () => {
        const dummyService = new DummyAdminService();
        const controller = new AdminController(dummyService);
        let resData = null;
        const req = { id: "req-1" };
        const res = {
            json(data) {
                resData = data;
                return this;
            }
        };
        await controller.getDashboard(req, res, () => { });
        assert.ok(resData);
        assert.strictEqual(resData.success, true);
        assert.strictEqual(resData.requestId, "req-1");
        assert.strictEqual(resData.data.leads, 1);
    });
    it("should get paginated leads with status filter", async () => {
        const dummyService = new DummyAdminService();
        const controller = new AdminController(dummyService);
        let resData = null;
        const req = {
            id: "req-2",
            query: { page: "2", status: "CONTACTED" }
        };
        const res = {
            json(data) {
                resData = data;
                return this;
            }
        };
        await controller.getLeads(req, res, () => { });
        assert.ok(resData);
        assert.strictEqual(resData.success, true);
        assert.strictEqual(resData.data.page, 2);
        assert.strictEqual(resData.data.data[0]?.status, "CONTACTED");
    });
    it("should update lead status and forward user context", async () => {
        const dummyService = new DummyAdminService();
        const controller = new AdminController(dummyService);
        let resData = null;
        const req = {
            id: "req-3",
            params: { id: "lead-abc" },
            body: { status: "DISCUSSION" },
            user: { id: "admin-123" }
        };
        const res = {
            json(data) {
                resData = data;
                return this;
            }
        };
        await controller.updateLeadStatus(req, res, () => { });
        assert.ok(resData);
        assert.strictEqual(resData.success, true);
        assert.strictEqual(resData.data.id, "lead-abc");
        assert.strictEqual(resData.data.status, "DISCUSSION");
    });
    it("should create service and return 201 status code", async () => {
        const dummyService = new DummyAdminService();
        const controller = new AdminController(dummyService);
        let resStatus = 200;
        let resData = null;
        const req = {
            id: "req-4",
            body: { title: "Cloud Optimization" },
            user: { id: "admin-123" }
        };
        const res = {
            status(code) {
                resStatus = code;
                return this;
            },
            json(data) {
                resData = data;
                return this;
            }
        };
        await controller.createService(req, res, () => { });
        assert.strictEqual(resStatus, 201);
        assert.ok(resData);
        assert.strictEqual(resData.success, true);
        assert.strictEqual(resData.data.title, "Cloud Optimization");
    });
});
