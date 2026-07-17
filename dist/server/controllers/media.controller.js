import { BadRequestError } from "../shared/errors.js";
export class MediaController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    uploadAsset = async (req, res, next) => {
        try {
            if (!req.file) {
                throw new BadRequestError("Asset file is required.");
            }
            const alt = typeof req.body.alt === "string" ? req.body.alt : undefined;
            const data = await this.mediaService.uploadAsset({
                buffer: req.file.buffer,
                originalName: req.file.originalname,
                alt
            });
            res.status(201).json({ success: true, data, requestId: req.id });
        }
        catch (error) {
            next(error);
        }
    };
    deleteAsset = async (req, res, next) => {
        try {
            const id = req.params.id;
            await this.mediaService.deleteAsset(id);
            res.status(200).json({ success: true, data: null, requestId: req.id });
        }
        catch (error) {
            next(error);
        }
    };
}
