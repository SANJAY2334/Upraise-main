import type { MediaAsset } from "@prisma/client";
import { prisma } from "../prisma.js";

export interface CreateMediaAssetInput {
  publicId: string;
  url: string;
  resourceType: string;
  format?: string | undefined;
  bytes?: number | undefined;
  width?: number | undefined;
  height?: number | undefined;
  alt?: string | undefined;
}

export interface IMediaRepository {
  createAsset(data: CreateMediaAssetInput): Promise<MediaAsset>;
  findAssetById(id: string): Promise<MediaAsset | null>;
  deleteAsset(id: string): Promise<void>;
}

export class MediaRepository implements IMediaRepository {
  constructor(private prismaClient = prisma) {}

  async createAsset(data: CreateMediaAssetInput): Promise<MediaAsset> {
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

  async findAssetById(id: string): Promise<MediaAsset | null> {
    return this.prismaClient.mediaAsset.findUnique({ where: { id } });
  }

  async deleteAsset(id: string): Promise<void> {
    await this.prismaClient.mediaAsset.delete({ where: { id } });
  }
}
