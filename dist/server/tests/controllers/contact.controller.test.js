import assert from "node:assert";
import { describe, it } from "node:test";
import { ContactController } from "../../controllers/contact.controller.js";
import { ContactService } from "../../services/contact.service.js";
class DummyContactService extends ContactService {
    constructor() {
        super(null);
    }
    async submitContact() {
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
        let statusVal = null;
        let resData = null;
        const req = {
            id: "req-abc",
            body: { name: "Bob", email: "bob@example.com" }
        };
        const res = {
            status(s) {
                statusVal = s;
                return this;
            },
            json(data) {
                resData = data;
                return this;
            }
        };
        await controller.submitContact(req, res, () => { });
        assert.strictEqual(statusVal, 201);
        assert.ok(resData);
        assert.strictEqual(resData.success, true);
        assert.strictEqual(resData.requestId, "req-abc");
        assert.strictEqual(resData.data.id, "dummy-id");
        assert.strictEqual(resData.data.status, "NEW");
    });
});
