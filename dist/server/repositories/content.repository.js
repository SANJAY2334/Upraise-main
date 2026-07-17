import { prisma } from "../prisma.js";
export class ContentRepository {
    prismaClient;
    constructor(prismaClient = prisma) {
        this.prismaClient = prismaClient;
    }
    async getPublishedServices() {
        return this.prismaClient.service.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });
    }
    async getPublishedCaseStudies() {
        return this.prismaClient.caseStudy.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } });
    }
    async getLatestPublishedBlogs(limit) {
        return this.prismaClient.blog.findMany({
            where: { isPublished: true },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                tags: { select: { id: true, name: true, slug: true } }
            },
            orderBy: { publishedAt: "desc" },
            take: limit
        });
    }
    async getPublishedClients() {
        return this.prismaClient.client.findMany({ where: { isPublished: true }, orderBy: { name: "asc" } });
    }
    async getPublishedTestimonials() {
        return this.prismaClient.testimonial.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } });
    }
    async getFounderProfile() {
        return this.prismaClient.founderProfile.findFirst({
            include: {
                timeline: true,
                highlights: true,
                portraitMedia: true
            }
        });
    }
}
