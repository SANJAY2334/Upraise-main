import assert from "node:assert";
import { describe, it } from "node:test";
import { AdminRepository } from "../../repositories/admin.repository.js";
describe("AdminRepository Unit Tests", () => {
    it("should count dashboard entities using mocked prisma", async () => {
        const mockPrisma = {
            lead: { count: async () => 5 },
            project: { count: async () => 10 },
            blog: { count: async () => 15 },
            mediaAsset: { count: async () => 20 },
            service: { count: async () => 25 },
            contactMessage: { count: async () => 30 }
        };
        const repo = new AdminRepository(mockPrisma);
        const leads = await repo.countLeads();
        const projects = await repo.countProjects();
        const blogs = await repo.countBlogs();
        const media = await repo.countMediaAssets();
        const services = await repo.countServices();
        const messages = await repo.countContactMessages();
        assert.strictEqual(leads, 5);
        assert.strictEqual(projects, 10);
        assert.strictEqual(blogs, 15);
        assert.strictEqual(media, 20);
        assert.strictEqual(services, 25);
        assert.strictEqual(messages, 30);
    });
    it("should fetch leads and count filtered leads using mocked prisma", async () => {
        let capturedWhere = null;
        const mockPrisma = {
            lead: {
                findMany: async (args) => {
                    capturedWhere = args.where;
                    return [{ id: "lead-1", name: "Jane" }];
                },
                count: async (_args) => {
                    return 1;
                }
            }
        };
        const repo = new AdminRepository(mockPrisma);
        const data = await repo.findLeads({ status: "NEW", skip: 0, take: 10 });
        const count = await repo.countLeadsFiltered({ status: "NEW" });
        assert.strictEqual(data.length, 1);
        assert.strictEqual(data[0]?.name, "Jane");
        assert.strictEqual(count, 1);
        assert.strictEqual(capturedWhere.status, "NEW");
    });
    it("should update lead status using mocked prisma", async () => {
        let capturedWhere = null;
        let capturedData = null;
        const mockPrisma = {
            lead: {
                update: async (args) => {
                    capturedWhere = args.where;
                    capturedData = args.data;
                    return { id: "lead-1", status: "CONTACTED" };
                }
            }
        };
        const repo = new AdminRepository(mockPrisma);
        const lead = await repo.updateLeadStatus("lead-1", "CONTACTED");
        assert.strictEqual(lead.id, "lead-1");
        assert.strictEqual(lead.status, "CONTACTED");
        assert.strictEqual(capturedWhere.id, "lead-1");
        assert.strictEqual(capturedData.status, "CONTACTED");
    });
    it("should create, update, and delete service using mocked prisma", async () => {
        let capturedCreateData = null;
        let capturedUpdateWhere = null;
        let capturedUpdateData = null;
        let capturedDeleteId = null;
        const mockPrisma = {
            service: {
                create: async (args) => {
                    capturedCreateData = args.data;
                    return { id: "svc-1", title: "Cloud Integration" };
                },
                update: async (args) => {
                    capturedUpdateWhere = args.where;
                    capturedUpdateData = args.data;
                    return { id: "svc-1", title: "Advanced Cloud Integration" };
                },
                delete: async (args) => {
                    capturedDeleteId = args.where.id;
                    return { id: "svc-1" };
                }
            }
        };
        const repo = new AdminRepository(mockPrisma);
        // Create
        const svc = await repo.createService({ title: "Cloud Integration" });
        assert.strictEqual(svc.id, "svc-1");
        assert.strictEqual(capturedCreateData.title, "Cloud Integration");
        // Update
        const updatedSvc = await repo.updateService("svc-1", { title: "Advanced Cloud Integration" });
        assert.strictEqual(updatedSvc.title, "Advanced Cloud Integration");
        assert.strictEqual(capturedUpdateWhere.id, "svc-1");
        assert.strictEqual(capturedUpdateData.title, "Advanced Cloud Integration");
        // Delete
        await repo.deleteService("svc-1");
        assert.strictEqual(capturedDeleteId, "svc-1");
    });
});
