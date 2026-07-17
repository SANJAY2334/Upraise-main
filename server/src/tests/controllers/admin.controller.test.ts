import assert from "node:assert";
import { describe, it } from "node:test";
import type { Request, Response } from "express";
import { AdminController } from "../../controllers/admin.controller.js";
import { AdminService } from "../../services/admin.service.js";

class DummyAdminService extends AdminService {
  constructor() {
    super(null as any, null as any);
  }
  override async getDashboardData() {
    return {
      leads: 1,
      projects: 2,
      blogs: 3,
      mediaAssets: 4,
      services: 5,
      messages: 6
    };
  }
  override async getLeads(params: any) {
    return {
      data: [{ id: "lead-1", status: params.status || "NEW" } as any],
      total: 1,
      page: params.page,
      limit: 20
    };
  }
  override async updateLeadStatus(params: any) {
    return { id: params.id, status: params.status } as any;
  }
  override async createService(_params: any) {
    return { id: "svc-1", title: "Cloud Optimization" } as any;
  }
}

describe("AdminController Unit Tests", () => {
  it("should get dashboard counts with standard payload", async () => {
    const dummyService = new DummyAdminService();
    const controller = new AdminController(dummyService);

    let resData: any = null;
    const req = { id: "req-1" } as unknown as Request;
    const res = {
      json(data: any) {
        resData = data;
        return this;
      }
    } as unknown as Response;

    await controller.getDashboard(req, res, () => {});

    assert.ok(resData);
    assert.strictEqual(resData.success, true);
    assert.strictEqual(resData.requestId, "req-1");
    assert.strictEqual(resData.data.leads, 1);
  });

  it("should get paginated leads with status filter", async () => {
    const dummyService = new DummyAdminService();
    const controller = new AdminController(dummyService);

    let resData: any = null;
    const req = {
      id: "req-2",
      query: { page: "2", status: "CONTACTED" }
    } as unknown as Request;

    const res = {
      json(data: any) {
        resData = data;
        return this;
      }
    } as unknown as Response;

    await controller.getLeads(req, res, () => {});

    assert.ok(resData);
    assert.strictEqual(resData.success, true);
    assert.strictEqual(resData.data.page, 2);
    assert.strictEqual(resData.data.data[0]?.status, "CONTACTED");
  });

  it("should update lead status and forward user context", async () => {
    const dummyService = new DummyAdminService();
    const controller = new AdminController(dummyService);

    let resData: any = null;
    const req = {
      id: "req-3",
      params: { id: "lead-abc" },
      body: { status: "DISCUSSION" },
      user: { id: "admin-123" }
    } as unknown as Request;

    const res = {
      json(data: any) {
        resData = data;
        return this;
      }
    } as unknown as Response;

    await controller.updateLeadStatus(req, res, () => {});

    assert.ok(resData);
    assert.strictEqual(resData.success, true);
    assert.strictEqual(resData.data.id, "lead-abc");
    assert.strictEqual(resData.data.status, "DISCUSSION");
  });

  it("should create service and return 201 status code", async () => {
    const dummyService = new DummyAdminService();
    const controller = new AdminController(dummyService);

    let resStatus = 200;
    let resData: any = null;
    const req = {
      id: "req-4",
      body: { title: "Cloud Optimization" },
      user: { id: "admin-123" }
    } as unknown as Request;

    const res = {
      status(code: number) {
        resStatus = code;
        return this;
      },
      json(data: any) {
        resData = data;
        return this;
      }
    } as unknown as Response;

    await controller.createService(req, res, () => {});

    assert.strictEqual(resStatus, 201);
    assert.ok(resData);
    assert.strictEqual(resData.success, true);
    assert.strictEqual(resData.data.title, "Cloud Optimization");
  });
});
