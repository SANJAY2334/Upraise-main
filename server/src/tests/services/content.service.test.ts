import assert from "node:assert";
import { describe, it } from "node:test";
import type { Service, CaseStudy, Client, Testimonial } from "@prisma/client";
import type {
  BlogWithRelations,
  FounderWithRelations,
  IContentRepository
} from "../../repositories/content.repository.js";
import { ContentService } from "../../services/content.service.js";

class MockContentRepository implements IContentRepository {
  async getPublishedServices(): Promise<Service[]> {
    return [
      {
        id: "s1",
        title: "Web Dev",
        slug: "web-dev",
        description: "Desc",
        deliverables: [],
        benefits: [],
        successStories: [],
        isPublished: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        seoSettingId: null
      } as Service
    ];
  }

  async getPublishedCaseStudies(): Promise<CaseStudy[]> {
    return [];
  }

  async getLatestPublishedBlogs(_limit: number): Promise<BlogWithRelations[]> {
    return [];
  }

  async getPublishedClients(): Promise<Client[]> {
    return [];
  }

  async getPublishedTestimonials(): Promise<Testimonial[]> {
    return [];
  }

  async getFounderProfile(): Promise<FounderWithRelations | null> {
    return null;
  }
}

describe("ContentService Unit Tests", () => {
  it("should retrieve and map public content successfully", async () => {
    const mockRepo = new MockContentRepository();
    const service = new ContentService(mockRepo);
    const content = await service.getPublicContent();

    assert.strictEqual(content.services.length, 1);
    assert.strictEqual(content.services[0]?.title, "Web Dev");
    assert.strictEqual(content.services[0]?.slug, "web-dev");
    assert.ok(Array.isArray(content.caseStudies));
    assert.ok(Array.isArray(content.blogs));
  });
});
