import assert from "node:assert";
import { describe, it } from "node:test";
import type { MediaAsset } from "@prisma/client";
import { MediaRepository } from "../../repositories/media.repository.js";

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

describe("MediaRepository Unit Tests", () => {
  it("should create a media asset using mocked prisma", async () => {
    let capturedArgs: unknown = null;
    const mockPrisma = {
      mediaAsset: {
        create: async (args: unknown) => {
          capturedArgs = args;
          return makeBaseAsset();
        }
      }
    };

    const repo = new MediaRepository(mockPrisma as any);
    const result = await repo.createAsset({
      publicId: "uprise/test-image",
      url: "https://res.cloudinary.com/demo/image/upload/v1/uprise/test-image",
      resourceType: "image",
      format: "jpg",
      bytes: 204800,
      width: 1920,
      height: 1080,
      alt: "Test image"
    });

    assert.ok(capturedArgs);
    assert.strictEqual(result.id, "asset-123");
    assert.strictEqual(result.publicId, "uprise/test-image");
    assert.strictEqual(result.resourceType, "image");
  });

  it("should find an asset by id using mocked prisma", async () => {
    const mockPrisma = {
      mediaAsset: {
        findUnique: async ({ where }: { where: { id: string } }) => (where.id === "asset-123" ? makeBaseAsset() : null)
      }
    };

    const repo = new MediaRepository(mockPrisma as any);
    const found = await repo.findAssetById("asset-123");
    const missing = await repo.findAssetById("does-not-exist");

    assert.ok(found);
    assert.strictEqual(found.id, "asset-123");
    assert.strictEqual(missing, null);
  });

  it("should delete an asset by id using mocked prisma", async () => {
    let deletedId: string | null = null;
    const mockPrisma = {
      mediaAsset: {
        delete: async ({ where }: { where: { id: string } }) => {
          deletedId = where.id;
          return makeBaseAsset();
        }
      }
    };

    const repo = new MediaRepository(mockPrisma as any);
    await repo.deleteAsset("asset-123");

    assert.strictEqual(deletedId, "asset-123");
  });
});
