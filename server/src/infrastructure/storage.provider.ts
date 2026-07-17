import type { UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";
import { BadRequestError } from "../shared/errors.js";

/**
 * Describes the result of a successful upload to an external storage provider.
 * This type is storage-provider agnostic from the Service layer's perspective.
 */
export interface StorageUploadResult {
  publicId: string;
  url: string;
  resourceType: string;
  format: string | undefined;
  bytes: number | undefined;
  width: number | undefined;
  height: number | undefined;
}

/**
 * Contract for any storage provider. Swap Cloudinary for S3, GCS, etc.
 * by providing a different implementation.
 */
export interface IStorageProvider {
  upload(buffer: Buffer, originalName: string): Promise<StorageUploadResult>;
  delete(publicId: string): Promise<void>;
}

export class CloudinaryStorageProvider implements IStorageProvider {
  constructor() {
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
      throw new BadRequestError("Cloudinary environment variables are not configured.");
    }
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret
    });
  }

  async upload(buffer: Buffer, _originalName: string): Promise<StorageUploadResult> {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "uprise",
          resource_type: "auto",
          quality: "auto",
          fetch_format: "auto"
        },
        (error, uploadResult) => (error || !uploadResult ? reject(error) : resolve(uploadResult))
      );
      stream.end(buffer);
    });

    return {
      publicId: result.public_id,
      url: result.secure_url,
      resourceType: result.resource_type,
      format: result.format ?? undefined,
      bytes: result.bytes ?? undefined,
      width: result.width ?? undefined,
      height: result.height ?? undefined
    };
  }

  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
