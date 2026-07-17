import { NotFoundError } from "../shared/errors.js";
export class MediaService {
    mediaRepo;
    storageProvider;
    constructor(mediaRepo, storageProvider) {
        this.mediaRepo = mediaRepo;
        this.storageProvider = storageProvider;
    }
    /**
     * Upload flow:
     *   1. Upload buffer to storage provider (Cloudinary)
     *   2. Persist the resulting metadata to the database via repository
     *   3. Return a DTO — never a raw Prisma model
     */
    async uploadAsset(input) {
        const uploaded = await this.storageProvider.upload(input.buffer, input.originalName);
        const asset = await this.mediaRepo.createAsset({
            publicId: uploaded.publicId,
            url: uploaded.url,
            resourceType: uploaded.resourceType,
            ...(uploaded.format !== undefined ? { format: uploaded.format } : {}),
            ...(uploaded.bytes !== undefined ? { bytes: uploaded.bytes } : {}),
            ...(uploaded.width !== undefined ? { width: uploaded.width } : {}),
            ...(uploaded.height !== undefined ? { height: uploaded.height } : {}),
            alt: input.alt ?? input.originalName
        });
        return this.toDTO(asset);
    }
    /**
     * Delete flow:
     *   1. Confirm the asset exists (throws NotFoundError otherwise)
     *   2. Delete from storage provider
     *   3. Delete record from the database via repository
     */
    async deleteAsset(id) {
        const asset = await this.mediaRepo.findAssetById(id);
        if (!asset) {
            throw new NotFoundError(`Media asset '${id}' not found.`);
        }
        await this.storageProvider.delete(asset.publicId);
        await this.mediaRepo.deleteAsset(id);
    }
    toDTO(asset) {
        return {
            id: asset.id,
            publicId: asset.publicId,
            url: asset.url,
            resourceType: asset.resourceType,
            format: asset.format ?? null,
            bytes: asset.bytes ?? null,
            width: asset.width ?? null,
            height: asset.height ?? null,
            alt: asset.alt ?? null,
            createdAt: asset.createdAt.toISOString()
        };
    }
}
