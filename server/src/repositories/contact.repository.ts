import type { ContactMessage, Lead } from "@prisma/client";
import { prisma } from "../prisma.js";

export type ContactMessageWithLead = ContactMessage & {
  lead: Lead | null;
};

export interface CreateContactInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  interest: string;
  message: string;
  consent: boolean;
}

export interface IContactRepository {
  createContact(data: CreateContactInput): Promise<ContactMessageWithLead>;
}

export class ContactRepository implements IContactRepository {
  constructor(private prismaClient = prisma) {}

  async createContact(data: CreateContactInput): Promise<ContactMessageWithLead> {
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
