import { prisma } from "../prisma.js";
export class ContactRepository {
    prismaClient;
    constructor(prismaClient = prisma) {
        this.prismaClient = prismaClient;
    }
    async createContact(data) {
        return this.prismaClient.contactMessage.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone ?? "",
                company: data.company ?? "",
                interest: data.interest,
                message: data.message,
                consent: data.consent,
                lead: {
                    create: {
                        name: data.name,
                        email: data.email,
                        phone: data.phone ?? "",
                        company: data.company ?? "",
                        source: "Website Contact",
                        interest: data.interest,
                        status: "NEW",
                        notes: data.message
                    }
                }
            },
            include: { lead: true }
        });
    }
}
