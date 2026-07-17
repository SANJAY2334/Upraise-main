import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";
import { BadRequestError } from "../shared/errors.js";
export class CloudinaryStorageProvider {
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
    async upload(buffer, _originalName) {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({
                folder: "uprise",
                resource_type: "auto",
                quality: "auto",
                fetch_format: "auto"
            }, (error, uploadResult) => (error || !uploadResult ? reject(error) : resolve(uploadResult)));
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
    async delete(publicId) {
        await cloudinary.uploader.destroy(publicId);
    }
}
