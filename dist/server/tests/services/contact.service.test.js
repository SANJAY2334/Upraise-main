import assert from "node:assert";
import { describe, it } from "node:test";
import { ContactService } from "../../services/contact.service.js";
class MockContactRepository {
    async createContact(data) {
        return {
            id: "msg-999",
            name: data.name,
            email: data.email,
            phone: data.phone ?? "",
            company: data.company ?? "",
            interest: data.interest,
            message: data.message,
            consent: data.consent,
            createdAt: new Date(),
            lead: {
                id: "lead-999",
                name: data.name,
                email: data.email,
                phone: data.phone ?? "",
                company: data.company ?? "",
                source: "Website Contact",
                interest: data.interest,
                status: "NEW",
                notes: data.message,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        };
    }
}
describe("ContactService Unit Tests", () => {
    it("should process contact submission and return serialized DTO", async () => {
        const mockRepo = new MockContactRepository();
        const service = new ContactService(mockRepo);
        const result = await service.submitContact({
            name: "Alice",
            email: "alice@example.com",
            interest: "Marketing",
            message: "Need help with branding",
            consent: true
        });
        assert.strictEqual(result.id, "msg-999");
        assert.strictEqual(result.status, "NEW");
    });
});
