import assert from "node:assert";
import { describe, it } from "node:test";
import { ContactRepository } from "../../repositories/contact.repository.js";
describe("ContactRepository Unit Tests", () => {
    it("should create a contact message and nested lead using mocked prisma", async () => {
        let createArgs = null;
        const mockPrisma = {
            contactMessage: {
                create: async (args) => {
                    createArgs = args;
                    return {
                        id: "msg-123",
                        name: "John Doe",
                        email: "john@example.com",
                        interest: "Design",
                        message: "Hello world",
                        consent: true,
                        createdAt: new Date(),
                        lead: { id: "lead-123", status: "NEW" }
                    };
                }
            }
        };
        const repo = new ContactRepository(mockPrisma);
        const result = await repo.createContact({
            name: "John Doe",
            email: "john@example.com",
            phone: "12345",
            company: "Acme",
            interest: "Design",
            message: "Hello world",
            consent: true
        });
        assert.ok(createArgs);
        assert.strictEqual(createArgs.data.name, "John Doe");
        assert.ok(createArgs.include.lead);
        assert.strictEqual(result.id, "msg-123");
        assert.strictEqual(result.lead?.id, "lead-123");
    });
});
