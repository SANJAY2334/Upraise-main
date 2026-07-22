import assert from "node:assert";
import { describe, it } from "node:test";
import type { IAdminRepository } from "../../repositories/admin.repository.js";
import { AdminService } from "../../services/admin.service.js";

const makeMockLead = (overrides = {}) => ({
  id: "lead-1",
  name: "John Doe",
  email: "john@example.com",
  phone: "123-456",
  company: "Acme Corp",
  source: "Web",
  interest: "Design",
  status: "NEW",
  notes: "Interested in rebranding.",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  ...overrides
});

const makeMockService = (overrides = {}) => ({
  id: "svc-1",
  title: "UI Design",
  slug: "ui-design",
  description: "Perfect user interface design.",
  deliverables: ["Wireframes"],
  benefits: ["Better usability"],
  successStories: [],
  isPublished: true,
  sortOrder: 1,
  ...overrides
});

describe("AdminService Unit Tests", () => {
  it("should get dashboard counts", async () => {
    const mockRepo: IAdminRepository = {
      countLeads: async () => 1,
      countProjects: async () => 2,
      countBlogs: async () => 3,
      countMediaAssets: async () => 4,
      countServices: async () => 5,
      countContactMessages: async () => 6,
      findLeads: async () => [],
      countLeadsFiltered: async () => 0,
      updateLeadStatus: async () => makeMockLead() as any,
      findContactMessages: async () => [],
      countContactMessagesFiltered: async () => 0,
      deleteContactMessage: async () => {},
      findServices: async () => [],
      countServicesFiltered: async () => 0,
      createService: async () => makeMockService() as any,
      updateService: async () => makeMockService() as any,
      deleteService: async () => {},
      findProjects: async () => [],
      countProjectsFiltered: async () => 0,
      createProject: async () => ({}) as any,
      updateProject: async () => ({}) as any,
      deleteProject: async () => {},
      findMediaAssets: async () => [],
      countMediaAssetsTotal: async () => 0,
      deleteMediaAsset: async () => {}
    };

    const service = new AdminService(mockRepo, async () => {});
    const counts = await service.getDashboardData();

    assert.strictEqual(counts.leads, 1);
    assert.strictEqual(counts.projects, 2);
    assert.strictEqual(counts.blogs, 3);
    assert.strictEqual(counts.mediaAssets, 4);
    assert.strictEqual(counts.services, 5);
    assert.strictEqual(counts.messages, 6);
  });

  it("should fetch paginated leads and return LeadDTOs", async () => {
    const mockRepo: IAdminRepository = {
      ...({} as any),
      findLeads: async () => [makeMockLead()],
      countLeadsFiltered: async () => 1
    };

    const service = new AdminService(mockRepo, async () => {});
    const result = await service.getLeads({ page: 1 });

    assert.strictEqual(result.data.length, 1);
    assert.strictEqual(result.total, 1);
    assert.strictEqual(result.data[0]?.id, "lead-1");
    assert.strictEqual(result.data[0]?.name, "John Doe");
    assert.strictEqual(result.data[0]?.createdAt, "2024-01-01T00:00:00.000Z");
  });

  it("should update lead status and create audit log", async () => {
    let capturedAuditLog: any = null;

    const mockRepo: IAdminRepository = {
      ...({} as any),
      updateLeadStatus: async (id, status) => makeMockLead({ id, status }) as any
    };

    const dummyAuditLog = async (input: any) => {
      capturedAuditLog = input;
    };

    const service = new AdminService(mockRepo, dummyAuditLog);
    const lead = await service.updateLeadStatus({ id: "lead-abc", status: "DISCUSSION", userId: "admin-1" });

    assert.strictEqual(lead.id, "lead-abc");
    assert.strictEqual(lead.status, "DISCUSSION");

    assert.ok(capturedAuditLog);
    assert.strictEqual(capturedAuditLog.action, "LEAD_STATUS_UPDATED");
    assert.strictEqual(capturedAuditLog.userId, "admin-1");
    assert.strictEqual(capturedAuditLog.entityId, "lead-abc");
    assert.strictEqual(capturedAuditLog.metadata.status, "DISCUSSION");
  });

  it("should create service and log action", async () => {
    let capturedAuditLog: any = null;

    const mockRepo: IAdminRepository = {
      ...({} as any),
      createService: async (data) => makeMockService(data) as any
    };

    const service = new AdminService(mockRepo, async (log) => {
      capturedAuditLog = log;
    });

    const svc = await service.createService({
      data: {
        title: "New Design Svc",
        slug: "new-design-svc",
        description: "Design services description"
      },
      userId: "admin-1"
    });
    assert.strictEqual(svc.title, "New Design Svc");
    assert.ok(capturedAuditLog);
    assert.strictEqual(capturedAuditLog.action, "SERVICE_CREATED");
    assert.strictEqual(capturedAuditLog.userId, "admin-1");
  });
});
