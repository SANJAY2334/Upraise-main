import assert from "node:assert";
import { describe, it } from "node:test";
import { ContentService } from "../../services/content.service.js";
class MockContentRepository {
    async getPublishedServices() {
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
            }
        ];
    }
    async getPublishedCaseStudies() {
        return [];
    }
    async getLatestPublishedBlogs(_limit) {
        return [];
    }
    async getPublishedClients() {
        return [];
    }
    async getPublishedTestimonials() {
        return [];
    }
    async getFounderProfile() {
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
