import { prisma } from "../prisma.js";
export class MediaRepository {
    prismaClient;
    constructor(prismaClient = prisma) {
        this.prismaClient = prismaClient;
    }
    async createAsset(data) {
        return this.prismaClient.mediaAsset.create({
            data: {
                publicId: data.publicId,
                url: data.url,
                resourceType: data.resourceType,
                ...(data.format !== undefined ? { format: data.format } : {}),
                ...(data.bytes !== undefined ? { bytes: data.bytes } : {}),
                ...(data.width !== undefined ? { width: data.width } : {}),
                ...(data.height !== undefined ? { height: data.height } : {}),
                ...(data.alt !== undefined ? { alt: data.alt } : {})
            }
        });
    }
    async findAssetById(id) {
        return this.prismaClient.mediaAsset.findUnique({ where: { id } });
    }
    async deleteAsset(id) {
        await this.prismaClient.mediaAsset.delete({ where: { id } });
    }
}
