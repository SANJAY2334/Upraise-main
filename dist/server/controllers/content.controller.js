export class ContentController {
    contentService;
    constructor(contentService) {
        this.contentService = contentService;
    }
    getPublicContent = async (req, res, next) => {
        try {
            const data = await this.contentService.getPublicContent();
            return res.json({
                success: true,
                data,
                requestId: req.id
            });
        }
        catch (error) {
            return next(error);
        }
    };
}
