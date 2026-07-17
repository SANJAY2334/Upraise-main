import type { IContentRepository } from "../repositories/content.repository.js";
import type { PublicContentResponseDTO } from "../shared/types.js";

export class ContentService {
  constructor(private contentRepo: IContentRepository) {}

  async getPublicContent(): Promise<PublicContentResponseDTO> {
    const [services, caseStudies, blogs, clients, testimonials, founder] = await Promise.all([
      this.contentRepo.getPublishedServices(),
      this.contentRepo.getPublishedCaseStudies(),
      this.contentRepo.getLatestPublishedBlogs(12),
      this.contentRepo.getPublishedClients(),
      this.contentRepo.getPublishedTestimonials(),
      this.contentRepo.getFounderProfile()
    ]);

    return {
      services: services.map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        description: s.description,
        deliverables: s.deliverables,
        benefits: s.benefits,
        successStories: s.successStories,
        isPublished: s.isPublished,
        sortOrder: s.sortOrder
      })),
      caseStudies: caseStudies.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        category: c.category,
        clientName: c.clientName,
        challenge: c.challenge,
        strategy: c.strategy,
        execution: c.execution,
        results: c.results,
        metrics: c.metrics,
        isFeatured: c.isFeatured,
        isPublished: c.isPublished
      })),
      blogs: blogs.map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        content: b.content,
        readTime: b.readTime,
        authorName: b.authorName,
        isFeatured: b.isFeatured,
        isPublished: b.isPublished,
        publishedAt: b.publishedAt ? b.publishedAt.toISOString() : null,
        ...(b.category
          ? {
              category: {
                name: b.category.name,
                slug: b.category.slug
              }
            }
          : {}),
        ...(b.tags
          ? {
              tags: b.tags.map((t) => ({
                name: t.name,
                slug: t.slug
              }))
            }
          : {})
      })),
      clients: clients.map((c) => ({
        id: c.id,
        name: c.name,
        industry: c.industry,
        website: c.website,
        isPublished: c.isPublished
      })),
      testimonials: testimonials.map((t) => ({
        id: t.id,
        quote: t.quote,
        name: t.name,
        title: t.title,
        company: t.company,
        rating: t.rating,
        isPublished: t.isPublished
      })),
      founder: founder
        ? {
            id: founder.id,
            name: founder.name,
            title: founder.title,
            biography: founder.biography,
            leadershipPhilosophy: founder.leadershipPhilosophy,
            industriesServed: founder.industriesServed,
            strategicExpertise: founder.strategicExpertise,
            achievements: founder.achievements,
            professionalSummary: founder.professionalSummary,
            clientImpact: founder.clientImpact,
            portraitMedia: founder.portraitMedia
              ? {
                  id: founder.portraitMedia.id,
                  publicId: founder.portraitMedia.publicId,
                  url: founder.portraitMedia.url,
                  resourceType: founder.portraitMedia.resourceType,
                  format: founder.portraitMedia.format,
                  bytes: founder.portraitMedia.bytes,
                  width: founder.portraitMedia.width,
                  height: founder.portraitMedia.height,
                  alt: founder.portraitMedia.alt,
                  createdAt: founder.portraitMedia.createdAt.toISOString()
                }
              : null,
            timeline: founder.timeline.map((ti) => ({
              year: ti.year,
              title: ti.title,
              detail: ti.detail
            })),
            highlights: founder.highlights.map((h) => ({
              label: h.label,
              value: h.value
            }))
          }
        : null
    };
  }
}
