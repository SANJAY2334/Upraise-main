import type { Lead, Project, MediaAsset, Service, ContactMessage } from "@prisma/client";
import { prisma } from "../prisma.js";

export type ContactMessageWithLead = ContactMessage & {
  lead: Lead | null;
};

export interface IAdminRepository {
  // Dashboard
  countLeads(): Promise<number>;
  countProjects(): Promise<number>;
  countBlogs(): Promise<number>;
  countMediaAssets(): Promise<number>;
  countServices(): Promise<number>;
  countContactMessages(): Promise<number>;

  // Leads
  findLeads(params: { status?: string | undefined; skip: number; take: number }): Promise<Lead[]>;
  countLeadsFiltered(params: { status?: string | undefined }): Promise<number>;
  updateLeadStatus(id: string, status: any): Promise<Lead>;

  // Contact Messages
  findContactMessages(params: {
    search?: string | undefined;
    skip: number;
    take: number;
  }): Promise<ContactMessageWithLead[]>;
  countContactMessagesFiltered(params: { search?: string | undefined }): Promise<number>;
  deleteContactMessage(id: string): Promise<void>;

  // Services
  findServices(params: { search?: string | undefined; skip: number; take: number }): Promise<Service[]>;
  countServicesFiltered(params: { search?: string | undefined }): Promise<number>;
  createService(data: any): Promise<Service>;
  updateService(id: string, data: any): Promise<Service>;
  deleteService(id: string): Promise<void>;

  // Projects
  findProjects(params: { search?: string | undefined; skip: number; take: number }): Promise<Project[]>;
  countProjectsFiltered(params: { search?: string | undefined }): Promise<number>;
  createProject(data: any): Promise<Project>;
  updateProject(id: string, data: any): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Media Assets
  findMediaAssets(params: { skip: number; take: number }): Promise<MediaAsset[]>;
  countMediaAssetsTotal(): Promise<number>;
  deleteMediaAsset(id: string): Promise<void>;
}

export class AdminRepository implements IAdminRepository {
  constructor(private prismaClient = prisma) {}

  // Dashboard
  async countLeads(): Promise<number> {
    return this.prismaClient.lead.count();
  }

  async countProjects(): Promise<number> {
    return this.prismaClient.project.count();
  }

  async countBlogs(): Promise<number> {
    return this.prismaClient.blog.count();
  }

  async countMediaAssets(): Promise<number> {
    return this.prismaClient.mediaAsset.count();
  }

  async countServices(): Promise<number> {
    return this.prismaClient.service.count();
  }

  async countContactMessages(): Promise<number> {
    return this.prismaClient.contactMessage.count();
  }

  // Leads
  async findLeads(params: { status?: string | undefined; skip: number; take: number }): Promise<Lead[]> {
    const where = params.status ? { status: params.status as any } : {};
    return this.prismaClient.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take
    });
  }

  async countLeadsFiltered(params: { status?: string | undefined }): Promise<number> {
    const where = params.status ? { status: params.status as any } : {};
    return this.prismaClient.lead.count({ where });
  }

  async updateLeadStatus(id: string, status: any): Promise<Lead> {
    return this.prismaClient.lead.update({
      where: { id },
      data: { status }
    });
  }

  // Contact Messages
  async findContactMessages(params: {
    search?: string | undefined;
    skip: number;
    take: number;
  }): Promise<ContactMessageWithLead[]> {
    const where = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { email: { contains: params.search, mode: "insensitive" as const } }
          ]
        }
      : {};

    return this.prismaClient.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
      include: { lead: true }
    });
  }

  async countContactMessagesFiltered(params: { search?: string | undefined }): Promise<number> {
    const where = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { email: { contains: params.search, mode: "insensitive" as const } }
          ]
        }
      : {};
    return this.prismaClient.contactMessage.count({ where });
  }

  async deleteContactMessage(id: string): Promise<void> {
    await this.prismaClient.contactMessage.delete({
      where: { id }
    });
  }

  // Services
  async findServices(params: { search?: string | undefined; skip: number; take: number }): Promise<Service[]> {
    const where = params.search ? { title: { contains: params.search, mode: "insensitive" as const } } : {};
    return this.prismaClient.service.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      skip: params.skip,
      take: params.take
    });
  }

  async countServicesFiltered(params: { search?: string | undefined }): Promise<number> {
    const where = params.search ? { title: { contains: params.search, mode: "insensitive" as const } } : {};
    return this.prismaClient.service.count({ where });
  }

  async createService(data: any): Promise<Service> {
    return this.prismaClient.service.create({ data });
  }

  async updateService(id: string, data: any): Promise<Service> {
    return this.prismaClient.service.update({
      where: { id },
      data
    });
  }

  async deleteService(id: string): Promise<void> {
    await this.prismaClient.service.delete({
      where: { id }
    });
  }

  // Projects
  async findProjects(params: { search?: string | undefined; skip: number; take: number }): Promise<Project[]> {
    const where = params.search ? { title: { contains: params.search, mode: "insensitive" as const } } : {};
    return this.prismaClient.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take
    });
  }

  async countProjectsFiltered(params: { search?: string | undefined }): Promise<number> {
    const where = params.search ? { title: { contains: params.search, mode: "insensitive" as const } } : {};
    return this.prismaClient.project.count({ where });
  }

  async createProject(data: any): Promise<Project> {
    return this.prismaClient.project.create({ data });
  }

  async updateProject(id: string, data: any): Promise<Project> {
    return this.prismaClient.project.update({
      where: { id },
      data
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.prismaClient.project.delete({
      where: { id }
    });
  }

  // Media Assets
  async findMediaAssets(params: { skip: number; take: number }): Promise<MediaAsset[]> {
    return this.prismaClient.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take
    });
  }

  async countMediaAssetsTotal(): Promise<number> {
    return this.prismaClient.mediaAsset.count();
  }

  async deleteMediaAsset(id: string): Promise<void> {
    await this.prismaClient.mediaAsset.delete({
      where: { id }
    });
  }
}
