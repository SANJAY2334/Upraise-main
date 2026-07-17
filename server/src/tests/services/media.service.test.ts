import assert from "node:assert";
import { describe, it } from "node:test";
import type { MediaAsset } from "@prisma/client";
import type { IStorageProvider, StorageUploadResult } from "../../infrastructure/storage.provider.js";
import type { IMediaRepository } from "../../repositories/media.repository.js";
import { MediaService } from "../../services/media.service.js";

/** Produces a complete Prisma MediaAsset scalar shape for mock returns. */
const makeBaseAsset = (overrides: Partial<MediaAsset> = {}): MediaAsset => ({
  id: "asset-123",
  publicId: "uprise/test-image",
  url: "https://res.cloudinary.com/demo/image/upload/v1/uprise/test-image",
  secureUrl: null,
  resourceType: "image",
  format: "jpg",
  bytes: 204800,
  width: 1920,
  height: 1080,
  duration: null,
  alt: "Test image",
  caption: null,
  folder: null,
  optimizedUrl: null,
  thumbnailUrl: null,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  ...overrides
});

const makeStorageResult = (): StorageUploadResult => ({
  publicId: "uprise/test-image",
  url: "https://res.cloudinary.com/demo/image/upload/v1/uprise/test-image",
  resourceType: "image",
  format: "jpg",
  bytes: 204800,
  width: 1920,
  height: 1080
});

describe("MediaService Unit Tests", () => {
  it("should upload an asset and return a DTO", async () => {
    const mockRepo: IMediaRepository = {
      createAsset: async () => makeBaseAsset(),
      findAssetById: async () => makeBaseAsset(),
      deleteAsset: async () => undefined
    };

    const mockStorage: IStorageProvider = {
      upload: async (): Promise<StorageUploadResult> => makeStorageResult(),
      delete: async () => undefined
    };

    const service = new MediaService(mockRepo, mockStorage);
    const dto = await service.uploadAsset({
      buffer: Buffer.from("test"),
      originalName: "test.jpg",
      alt: "Test image"
    });

    assert.strictEqual(dto.id, "asset-123");
    assert.strictEqual(dto.publicId, "uprise/test-image");
    assert.strictEqual(dto.resourceType, "image");
    assert.ok(typeof dto.createdAt === "string", "createdAt must be serialized to ISO string");
  });

  it("should use the originalName as alt when alt is not provided", async () => {
    let capturedAlt: string | undefined;

    const mockRepo: IMediaRepository = {
      createAsset: async (data) => {
        capturedAlt = data.alt;
        return makeBaseAsset({ alt: data.alt ?? null });
      },
      findAssetById: async () => makeBaseAsset(),
      deleteAsset: async () => undefined
    };

    const mockStorage: IStorageProvider = {
      upload: async (): Promise<StorageUploadResult> => makeStorageResult(),
      delete: async () => undefined
    };

    const service = new MediaService(mockRepo, mockStorage);
    await service.uploadAsset({
      buffer: Buffer.from("test"),
      originalName: "photo.jpg"
    });

    assert.strictEqual(capturedAlt, "photo.jpg");
  });

  it("should throw NotFoundError when deleting a non-existent asset", async () => {
    const mockRepo: IMediaRepository = {
      createAsset: async () => makeBaseAsset(),
      findAssetById: async () => null,
      deleteAsset: async () => undefined
    };

    const mockStorage: IStorageProvider = {
      upload: async (): Promise<StorageUploadResult> => makeStorageResult(),
      delete: async () => undefined
    };

    const service = new MediaService(mockRepo, mockStorage);

    await assert.rejects(
      () => service.deleteAsset("non-existent-id"),
      (err: Error) => {
        assert.ok(err.message.includes("non-existent-id"));
        return true;
      }
    );
  });

  it("should call storageProvider.delete and repo.deleteAsset when deleting an existing asset", async () => {
    let storageDeleteCalled = false;
    let repoDeleteCalled = false;

    const mockRepo: IMediaRepository = {
      createAsset: async () => makeBaseAsset(),
      findAssetById: async () => makeBaseAsset(),
      deleteAsset: async () => {
        repoDeleteCalled = true;
      }
    };

    const mockStorage: IStorageProvider = {
      upload: async (): Promise<StorageUploadResult> => makeStorageResult(),
      delete: async () => {
        storageDeleteCalled = true;
      }
    };

    const service = new MediaService(mockRepo, mockStorage);
    await service.deleteAsset("asset-123");

    assert.ok(storageDeleteCalled, "Storage provider delete must be called");
    assert.ok(repoDeleteCalled, "Repository deleteAsset must be called");
  });
});
