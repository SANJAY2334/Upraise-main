import { prisma } from "../prisma.js";
export class AdminRepository {
    prismaClient;
    constructor(prismaClient = prisma) {
        this.prismaClient = prismaClient;
    }
    // Dashboard
    async countLeads() {
        return this.prismaClient.lead.count();
    }
    async countProjects() {
        return this.prismaClient.project.count();
    }
    async countBlogs() {
        return this.prismaClient.blog.count();
    }
    async countMediaAssets() {
        return this.prismaClient.mediaAsset.count();
    }
    async countServices() {
        return this.prismaClient.service.count();
    }
    async countContactMessages() {
        return this.prismaClient.contactMessage.count();
    }
    // Leads
    async findLeads(params) {
        const where = params.status ? { status: params.status } : {};
        return this.prismaClient.lead.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: params.skip,
            take: params.take
        });
    }
    async countLeadsFiltered(params) {
        const where = params.status ? { status: params.status } : {};
        return this.prismaClient.lead.count({ where });
    }
    async updateLeadStatus(id, status) {
        return this.prismaClient.lead.update({
            where: { id },
            data: { status }
        });
    }
    // Contact Messages
    async findContactMessages(params) {
        const where = params.search
            ? {
                OR: [
                    { name: { contains: params.search, mode: "insensitive" } },
                    { email: { contains: params.search, mode: "insensitive" } }
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
    async countContactMessagesFiltered(params) {
        const where = params.search
            ? {
                OR: [
                    { name: { contains: params.search, mode: "insensitive" } },
                    { email: { contains: params.search, mode: "insensitive" } }
                ]
            }
            : {};
        return this.prismaClient.contactMessage.count({ where });
    }
    async deleteContactMessage(id) {
        await this.prismaClient.contactMessage.delete({
            where: { id }
        });
    }
    // Services
    async findServices(params) {
        const where = params.search
            ? { title: { contains: params.search, mode: "insensitive" } }
            : {};
        return this.prismaClient.service.findMany({
            where,
            orderBy: { sortOrder: "asc" },
            skip: params.skip,
            take: params.take
        });
    }
    async countServicesFiltered(params) {
        const where = params.search
            ? { title: { contains: params.search, mode: "insensitive" } }
            : {};
        return this.prismaClient.service.count({ where });
    }
    async createService(data) {
        return this.prismaClient.service.create({ data });
    }
    async updateService(id, data) {
        return this.prismaClient.service.update({
            where: { id },
            data
        });
    }
    async deleteService(id) {
        await this.prismaClient.service.delete({
            where: { id }
        });
    }
    // Projects
    async findProjects(params) {
        const where = params.search
            ? { title: { contains: params.search, mode: "insensitive" } }
            : {};
        return this.prismaClient.project.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: params.skip,
            take: params.take
        });
    }
    async countProjectsFiltered(params) {
        const where = params.search
            ? { title: { contains: params.search, mode: "insensitive" } }
            : {};
        return this.prismaClient.project.count({ where });
    }
    async createProject(data) {
        return this.prismaClient.project.create({ data });
    }
    async updateProject(id, data) {
        return this.prismaClient.project.update({
            where: { id },
            data
        });
    }
    async deleteProject(id) {
        await this.prismaClient.project.delete({
            where: { id }
        });
    }
    // Media Assets
    async findMediaAssets(params) {
        return this.prismaClient.mediaAsset.findMany({
            orderBy: { createdAt: "desc" },
            skip: params.skip,
            take: params.take
        });
    }
    async countMediaAssetsTotal() {
        return this.prismaClient.mediaAsset.count();
    }
    async deleteMediaAsset(id) {
        await this.prismaClient.mediaAsset.delete({
            where: { id }
        });
    }
}
