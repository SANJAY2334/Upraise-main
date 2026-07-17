import { useState } from "react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  company: z.string().optional(),
  interest: z.string().min(1, "Please select an interest."),
  message: z.string().min(10, "Inquiry message must be at least 10 characters."),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to be contacted."
  })
});

type MutationType = {
  mutate: (payload: {
    name: string;
    email: string;
    phone: string;
    company: string;
    interest: string;
    message: string;
    consent: boolean;
  }) => void;
};

export function useContactForm(mutation: MutationType) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleContactSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      company: String(form.get("company") || ""),
      interest: String(form.get("interest") || ""),
      message: String(form.get("message") || ""),
      consent: form.get("consent") === "on"
    };

    // Client-side layered validation with Zod
    const result = contactSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) {
          fieldErrors[String(issue.path[0])] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    mutation.mutate(payload);
  };

  return {
    errors,
    handleContactSubmit
  };
}
