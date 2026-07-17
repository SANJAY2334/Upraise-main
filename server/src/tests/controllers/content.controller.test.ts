import assert from "node:assert";
import { describe, it } from "node:test";
import type { Request, Response } from "express";
import { ContentController } from "../../controllers/content.controller.js";
import { ContentService } from "../../services/content.service.js";

class DummyContentService extends ContentService {
  constructor() {
    super(null as any);
  }
  override async getPublicContent() {
    return {
      services: [],
      caseStudies: [],
      blogs: [],
      clients: [],
      testimonials: [],
      founder: null
    };
  }
}

describe("ContentController Unit Tests", () => {
  it("should respond with standard success payload containing DTO data", async () => {
    const dummyService = new DummyContentService();
    const controller = new ContentController(dummyService);

    let resData: any = null;
    const req = { id: "test-req-id" } as unknown as Request;
    const res = {
      json(data: any) {
        resData = data;
        return this;
      }
    } as unknown as Response;

    await controller.getPublicContent(req, res, () => {});

    assert.ok(resData);
    assert.strictEqual(resData.success, true);
    assert.strictEqual(resData.requestId, "test-req-id");
    assert.ok(Array.isArray(resData.data.services));
  });
});
