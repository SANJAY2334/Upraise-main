import type { IContactRepository, CreateContactInput } from "../repositories/contact.repository.js";
import type { ContactResponseDTO } from "../shared/types.js";
import { writeAuditLog } from "./audit.js";

export class ContactService {
  constructor(
    private contactRepo: IContactRepository,
    private auditLog = writeAuditLog
  ) {}

  async submitContact(data: CreateContactInput): Promise<ContactResponseDTO> {
    const message = await this.contactRepo.createContact(data);

    await this.auditLog({
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
