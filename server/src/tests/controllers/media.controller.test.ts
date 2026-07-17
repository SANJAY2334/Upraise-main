import assert from "node:assert";
import { describe, it } from "node:test";
import { MediaController } from "../../controllers/media.controller.js";
import type { MediaService } from "../../services/media.service.js";
import type { MediaAssetDTO } from "../../shared/types.js";

const makeDTO = (): MediaAssetDTO => ({
  id: "asset-123",
  publicId: "uprise/test-image",
  url: "https://res.cloudinary.com/demo/image/upload/v1/uprise/test-image",
  resourceType: "image",
  format: "jpg",
  bytes: 204800,
  width: 1920,
  height: 1080,
  alt: "Test image",
  createdAt: "2024-01-01T00:00:00.000Z"
});

const makeReq = (overrides: object = {}) =>
  ({
    id: "req-test-id",
    file: {
      buffer: Buffer.from("test"),
      originalname: "test.jpg"
    },
    body: {},
    params: {},
    ...overrides
  }) as any;

/** Build a minimal Express-like res mock with independently trackable state. */
function makeRes() {
  let _statusCode = 200;
  let _body: unknown = undefined;
  const self = {
    status(code: number) {
      _statusCode = code;
      return self;
    },
    json(payload: unknown) {
      _body = payload;
      return self;
    },
    get statusCode() {
      return _statusCode;
    },
    get body() {
      return _body;
    }
  };
  return self as any;
}

describe("MediaController Unit Tests", () => {
  it("should upload an asset and return 201 with a DTO", async () => {
    const mockService = {
      uploadAsset: async (): Promise<MediaAssetDTO> => makeDTO()
    } as unknown as MediaService;

    const controller = new MediaController(mockService);
    const req = makeReq();
    const res = makeRes();
    const next = (err?: unknown) => {
      if (err) throw err;
    };

    await controller.uploadAsset(req, res, next);

    assert.strictEqual(res.statusCode, 201);
    const payload = res.body as { success: boolean; data: MediaAssetDTO; requestId: string };
    assert.strictEqual(payload.success, true);
    assert.strictEqual(payload.data.id, "asset-123");
    assert.strictEqual(payload.requestId, "req-test-id");
  });

  it("should call next with BadRequestError when no file is provided", async () => {
    const mockService = {
      uploadAsset: async (): Promise<MediaAssetDTO> => makeDTO()
    } as unknown as MediaService;

    const controller = new MediaController(mockService);
    const req = makeReq({ file: undefined });
    const res = makeRes();
    let capturedError: unknown = null;

    await controller.uploadAsset(req, res, (err) => {
      capturedError = err;
    });

    assert.ok(capturedError instanceof Error);
    assert.ok((capturedError as Error).message.includes("Asset file is required"));
  });

  it("should delete an asset and return 200", async () => {
    const mockService = {
      deleteAsset: async (_id: string): Promise<void> => undefined
    } as unknown as MediaService;

    const controller = new MediaController(mockService);
    const req = makeReq({ params: { id: "asset-123" } });
    const res = makeRes();
    const next = (err?: unknown) => {
      if (err) throw err;
    };

    await controller.deleteAsset(req, res, next);

    assert.strictEqual(res.statusCode, 200);
    const payload = res.body as { success: boolean; data: null; requestId: string };
    assert.strictEqual(payload.success, true);
    assert.strictEqual(payload.data, null);
  });

  it("should forward service errors to next on delete", async () => {
    const mockService = {
      deleteAsset: async (_id: string): Promise<void> => {
        throw new Error("Not found");
      }
    } as unknown as MediaService;

    const controller = new MediaController(mockService);
    const req = makeReq({ params: { id: "missing-id" } });
    const res = makeRes();
    let capturedError: unknown = null;

    await controller.deleteAsset(req, res, (err) => {
      capturedError = err;
    });

    assert.ok(capturedError instanceof Error);
    assert.strictEqual((capturedError as Error).message, "Not found");
  });
});
