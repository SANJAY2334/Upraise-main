import { writeAuditLog } from "./audit.js";
export class ContactService {
    contactRepo;
    constructor(contactRepo) {
        this.contactRepo = contactRepo;
    }
    async submitContact(data) {
        const message = await this.contactRepo.createContact(data);
        await writeAuditLog({
            action: "CONTACT_SUBMITTED",
            entity: "contact_messages",
            entityId: message.id,
            metadata: { interest: data.interest }
        });
        return {
            id: message.id,
            status: message.lead?.status ?? "New"
        };
    }
}
