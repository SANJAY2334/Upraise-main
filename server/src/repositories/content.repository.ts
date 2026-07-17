import type {
  Service,
  CaseStudy,
  Blog,
  Client,
  Testimonial,
  FounderProfile,
  FounderTimeline,
  FounderHighlight,
  MediaAsset
} from "@prisma/client";
import { prisma } from "../prisma.js";

export type BlogWithRelations = Blog & {
  category: { id: string; name: string; slug: string };
  tags: { id: string; name: string; slug: string }[];
};

export type FounderWithRelations = FounderProfile & {
  timeline: FounderTimeline[];
  highlights: FounderHighlight[];
  portraitMedia: MediaAsset | null;
};

export interface IContentRepository {
  getPublishedServices(): Promise<Service[]>;
  getPublishedCaseStudies(): Promise<CaseStudy[]>;
  getLatestPublishedBlogs(limit: number): Promise<BlogWithRelations[]>;
  getPublishedClients(): Promise<Client[]>;
  getPublishedTestimonials(): Promise<Testimonial[]>;
  getFounderProfile(): Promise<FounderWithRelations | null>;
}

export class ContentRepository implements IContentRepository {
  constructor(private prismaClient = prisma) {}

  async getPublishedServices(): Promise<Service[]> {
    return this.prismaClient.service.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });
  }

  async getPublishedCaseStudies(): Promise<CaseStudy[]> {
    return this.prismaClient.caseStudy.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } });
  }

  async getLatestPublishedBlogs(limit: number): Promise<BlogWithRelations[]> {
    return this.prismaClient.blog.findMany({
      where: { isPublished: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } }
      },
      orderBy: { publishedAt: "desc" },
      take: limit
    }) as Promise<BlogWithRelations[]>;
  }

  async getPublishedClients(): Promise<Client[]> {
    return this.prismaClient.client.findMany({ where: { isPublished: true }, orderBy: { name: "asc" } });
  }

  async getPublishedTestimonials(): Promise<Testimonial[]> {
    return this.prismaClient.testimonial.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } });
  }

  async getFounderProfile(): Promise<FounderWithRelations | null> {
    return this.prismaClient.founderProfile.findFirst({
      include: {
        timeline: true,
        highlights: true,
        portraitMedia: true
      }
    }) as Promise<FounderWithRelations | null>;
  }
}
