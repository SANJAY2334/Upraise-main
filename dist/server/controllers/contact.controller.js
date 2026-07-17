export class ContactController {
    contactService;
    constructor(contactService) {
        this.contactService = contactService;
    }
    submitContact = async (req, res, next) => {
        try {
            const data = await this.contactService.submitContact(req.body);
            return res.status(201).json({
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
