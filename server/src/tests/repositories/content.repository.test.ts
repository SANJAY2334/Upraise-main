import assert from "node:assert";
import { describe, it } from "node:test";
import { ContentRepository } from "../../repositories/content.repository.js";

describe("ContentRepository Unit Tests", () => {
  it("should fetch published services using mocked prisma", async () => {
    const mockPrisma = {
      service: {
        findMany: async () => [{ id: "s-mock", title: "Mock Service" }]
      }
    };
    const repo = new ContentRepository(mockPrisma as any);

    const services = await repo.getPublishedServices();
    assert.strictEqual(services.length, 1);
    assert.strictEqual(services[0]?.title, "Mock Service");
  });

  it("should fetch published case studies using mocked prisma", async () => {
    const mockPrisma = {
      caseStudy: {
        findMany: async () => [{ id: "c-mock", title: "Mock Case Study" }]
      }
    };
    const repo = new ContentRepository(mockPrisma as any);

    const caseStudies = await repo.getPublishedCaseStudies();
    assert.strictEqual(caseStudies.length, 1);
    assert.strictEqual(caseStudies[0]?.title, "Mock Case Study");
  });

  it("should fetch latest published blogs using mocked prisma", async () => {
    const mockPrisma = {
      blog: {
        findMany: async () => [{ id: "b-mock", title: "Mock Blog" }]
      }
    };
    const repo = new ContentRepository(mockPrisma as any);

    const blogs = await repo.getLatestPublishedBlogs(5);
    assert.strictEqual(blogs.length, 1);
    assert.strictEqual(blogs[0]?.title, "Mock Blog");
  });
});
