import assert from "node:assert";
import { describe, it } from "node:test";
import type { Request, Response } from "express";
import { ContactController } from "../../controllers/contact.controller.js";
import { ContactService } from "../../services/contact.service.js";

class DummyContactService extends ContactService {
  constructor() {
    super(null as any);
  }
  override async submitContact() {
    return {
      id: "dummy-id",
      status: "NEW"
    };
  }
}

describe("ContactController Unit Tests", () => {
  it("should respond with standard success payload containing DTO data", async () => {
    const dummyService = new DummyContactService();
    const controller = new ContactController(dummyService);

    let statusVal: number | null = null;
    let resData: any = null;

    const req = {
      id: "req-abc",
      body: { name: "Bob", email: "bob@example.com" }
    } as unknown as Request;

    const res = {
      status(s: number) {
        statusVal = s;
        return this;
      },
      json(data: any) {
        resData = data;
        return this;
      }
    } as unknown as Response;

    await controller.submitContact(req, res, () => {});

    assert.strictEqual(statusVal, 201);
    assert.ok(resData);
    assert.strictEqual(resData.success, true);
    assert.strictEqual(resData.requestId, "req-abc");
    assert.strictEqual(resData.data.id, "dummy-id");
    assert.strictEqual(resData.data.status, "NEW");
  });
});
