import type { IAdminRepository } from "../repositories/admin.repository.js";
import type {
  DashboardResponseDTO,
  LeadDTO,
  ContactMessageDTO,
  ServiceDTO,
  ProjectDTO,
  MediaAssetDTO,
  PaginatedResponseDTO
} from "../shared/types.js";
import { writeAuditLog } from "./audit.js";

export class AdminService {
  private readonly limit = 20;

  constructor(
    private adminRepo: IAdminRepository,
    private auditLog = writeAuditLog
  ) {}

  // Dashboard
  async getDashboardData(): Promise<DashboardResponseDTO> {
    const [leads, projects, blogs, mediaAssets, services, messages] = await Promise.all([
      this.adminRepo.countLeads(),
      this.adminRepo.countProjects(),
      this.adminRepo.countBlogs(),
      this.adminRepo.countMediaAssets(),
      this.adminRepo.countServices(),
      this.adminRepo.countContactMessages()
    ]);

    return {
      leads,
      projects,
      blogs,
      mediaAssets,
      services,
      messages
    };
  }

  // Leads
  async getLeads(params: { status?: string | undefined; page: number }): Promise<PaginatedResponseDTO<LeadDTO>> {
    const page = Math.max(1, params.page);
    const skip = (page - 1) * this.limit;

    const [leads, total] = await Promise.all([
      this.adminRepo.findLeads({ status: params.status, skip, take: this.limit }),
      this.adminRepo.countLeadsFiltered({ status: params.status })
    ]);

    return {
      data: leads.map((l) => this.toLeadDTO(l)),
      total,
      page,
      limit: this.limit
    };
  }

  async updateLeadStatus(params: { id: string; status: string; userId?: string | undefined }): Promise<LeadDTO> {
    const lead = await this.adminRepo.updateLeadStatus(params.id, params.status);

    await this.auditLog({
      userId: params.userId,
      action: "LEAD_STATUS_UPDATED",
      entity: "leads",
      entityId: lead.id,
      metadata: { status: lead.status }
    });

    return this.toLeadDTO(lead);
  }

  // Contact Messages
  async getContactMessages(params: {
    search?: string | undefined;
    page: number;
  }): Promise<PaginatedResponseDTO<ContactMessageDTO>> {
    const page = Math.max(1, params.page);
    const skip = (page - 1) * this.limit;

    const [messages, total] = await Promise.all([
      this.adminRepo.findContactMessages({ search: params.search, skip, take: this.limit }),
      this.adminRepo.countContactMessagesFiltered({ search: params.search })
    ]);

    return {
      data: messages.map((m) => this.toContactMessageDTO(m)),
      total,
      page,
      limit: this.limit
    };
  }

  async deleteContactMessage(params: { id: string; userId?: string | undefined }): Promise<void> {
    await this.adminRepo.deleteContactMessage(params.id);

    await this.auditLog({
      userId: params.userId,
      action: "MESSAGE_DELETED",
      entity: "contact_messages",
      entityId: params.id
    });
  }

  // Services
  async getServices(params: { search?: string | undefined; page: number }): Promise<PaginatedResponseDTO<ServiceDTO>> {
    const page = Math.max(1, params.page);
    const skip = (page - 1) * this.limit;

    const [services, total] = await Promise.all([
      this.adminRepo.findServices({ search: params.search, skip, take: this.limit }),
      this.adminRepo.countServicesFiltered({ search: params.search })
    ]);

    return {
      data: services.map((s) => this.toServiceDTO(s)),
      total,
      page,
      limit: this.limit
    };
  }

  async createService(params: { data: any; userId?: string | undefined }): Promise<ServiceDTO> {
    const service = await this.adminRepo.createService(params.data);

    await this.auditLog({
      userId: params.userId,
      action: "SERVICE_CREATED",
      entity: "services",
      entityId: service.id
    });

    return this.toServiceDTO(service);
  }

  async updateService(params: { id: string; data: any; userId?: string | undefined }): Promise<ServiceDTO> {
    const service = await this.adminRepo.updateService(params.id, params.data);

    await this.auditLog({
      userId: params.userId,
      action: "SERVICE_UPDATED",
      entity: "services",
      entityId: service.id
    });

    return this.toServiceDTO(service);
  }

  async deleteService(params: { id: string; userId?: string | undefined }): Promise<void> {
    await this.adminRepo.deleteService(params.id);

    await this.auditLog({
      userId: params.userId,
      action: "SERVICE_DELETED",
      entity: "services",
      entityId: params.id
    });
  }

  // Projects
  async getProjects(params: { search?: string | undefined; page: number }): Promise<PaginatedResponseDTO<ProjectDTO>> {
    const page = Math.max(1, params.page);
    const skip = (page - 1) * this.limit;

    const [projects, total] = await Promise.all([
      this.adminRepo.findProjects({ search: params.search, skip, take: this.limit }),
      this.adminRepo.countProjectsFiltered({ search: params.search })
    ]);

    return {
      data: projects.map((p) => this.toProjectDTO(p)),
      total,
      page,
      limit: this.limit
    };
  }

  async createProject(params: { data: any; userId?: string | undefined }): Promise<ProjectDTO> {
    const project = await this.adminRepo.createProject(params.data);

    await this.auditLog({
      userId: params.userId,
      action: "PROJECT_CREATED",
      entity: "projects",
      entityId: project.id
    });

    return this.toProjectDTO(project);
  }

  async updateProject(params: { id: string; data: any; userId?: string | undefined }): Promise<ProjectDTO> {
    const project = await this.adminRepo.updateProject(params.id, params.data);

    await this.auditLog({
      userId: params.userId,
      action: "PROJECT_UPDATED",
      entity: "projects",
      entityId: project.id
    });

    return this.toProjectDTO(project);
  }

  async deleteProject(params: { id: string; userId?: string | undefined }): Promise<void> {
    await this.adminRepo.deleteProject(params.id);

    await this.auditLog({
      userId: params.userId,
      action: "PROJECT_DELETED",
      entity: "projects",
      entityId: params.id
    });
  }

  // Media Assets
  async getMediaAssets(params: { page: number }): Promise<PaginatedResponseDTO<MediaAssetDTO>> {
    const page = Math.max(1, params.page);
    const skip = (page - 1) * this.limit;

    const [media, total] = await Promise.all([
      this.adminRepo.findMediaAssets({ skip, take: this.limit }),
      this.adminRepo.countMediaAssetsTotal()
    ]);

    return {
      data: media.map((m) => this.toMediaAssetDTO(m)),
      total,
      page,
      limit: this.limit
    };
  }

  async deleteMediaAsset(params: { id: string; userId?: string | undefined }): Promise<void> {
    await this.adminRepo.deleteMediaAsset(params.id);

    await this.auditLog({
      userId: params.userId,
      action: "MEDIA_DELETED",
      entity: "media_assets",
      entityId: params.id
    });
  }

  // Mappers
  private toLeadDTO(lead: any): LeadDTO {
    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone ?? null,
      company: lead.company ?? null,
      source: lead.source,
      interest: lead.interest,
      status: lead.status,
      notes: lead.notes ?? null,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString()
    };
  }

  private toContactMessageDTO(msg: any): ContactMessageDTO {
    return {
      id: msg.id,
      name: msg.name,
      email: msg.email,
      phone: msg.phone ?? null,
      company: msg.company ?? null,
      interest: msg.interest,
      message: msg.message,
      consent: msg.consent,
      createdAt: msg.createdAt.toISOString(),
      ...(msg.lead
        ? {
            lead: {
              status: msg.lead.status
            }
          }
        : {})
    };
  }

  private toServiceDTO(s: any): ServiceDTO {
    return {
      id: s.id,
      title: s.title,
      slug: s.slug,
      description: s.description,
      deliverables: s.deliverables,
      benefits: s.benefits,
      successStories: s.successStories,
      isPublished: s.isPublished,
      sortOrder: s.sortOrder
    };
  }

  private toProjectDTO(p: any): ProjectDTO {
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      clientName: p.clientName,
      story: p.story,
      results: p.results,
      isFeatured: p.isFeatured,
      isPublished: p.isPublished,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    };
  }

  private toMediaAssetDTO(m: any): MediaAssetDTO {
    return {
      id: m.id,
      publicId: m.publicId,
      url: m.url,
      resourceType: m.resourceType,
      format: m.format ?? null,
      bytes: m.bytes ?? null,
      width: m.width ?? null,
      height: m.height ?? null,
      alt: m.alt ?? null,
      createdAt: m.createdAt.toISOString()
    };
  }
}
