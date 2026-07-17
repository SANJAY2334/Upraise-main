import { Send } from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Form,
  FormField,
  FormLabel,
  FormMessage
} from "../../../shared/components";
import { useContactForm } from "../hooks/useContactForm";

type Props = {
  services: Array<{ title: string; slug: string }>;
  mutation: {
    mutate: (payload: {
      name: string;
      email: string;
      phone: string;
      company: string;
      interest: string;
      message: string;
      consent: boolean;
    }) => void;
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: any;
    data: any;
  };
};

export default function ContactSection({ services, mutation }: Props) {
  const { errors, handleContactSubmit } = useContactForm(mutation);

  const serviceOptions = services.map((s) => ({
    label: s.title,
    value: s.title // Keep compatibility with existing submit schema value which is title
  }));

  return (
    <section id="contact" className="border-t border-border bg-surface py-24">
      <div className="container-shell grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-gold">Contact CTA</p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Build the next visible moment with discipline.
          </h2>
          <p className="mt-6 text-base leading-8 text-muted">
            Share the mandate. The CRM captures the inquiry, assigns it as a new lead, and routes it into the admin
            pipeline for follow-up.
          </p>
        </div>

        <Form onSubmit={handleContactSubmit} className="premium-border grid gap-4 bg-black/25 p-6 sm:p-8" noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField name="name" error={errors.name}>
              <FormLabel required>Name</FormLabel>
              <Input name="name" required placeholder="e.g. John Doe" autoComplete="name" />
              <FormMessage />
            </FormField>

            <FormField name="email" error={errors.email}>
              <FormLabel required>Email</FormLabel>
              <Input name="email" type="email" required placeholder="e.g. john@company.com" autoComplete="email" />
              <FormMessage />
            </FormField>

            <FormField name="phone" error={errors.phone}>
              <FormLabel>Phone</FormLabel>
              <Input name="phone" placeholder="e.g. +1 (555) 000-0000" autoComplete="tel" />
              <FormMessage />
            </FormField>

            <FormField name="company" error={errors.company}>
              <FormLabel>Company</FormLabel>
              <Input name="company" placeholder="e.g. Acme Corp" autoComplete="organization" />
              <FormMessage />
            </FormField>
          </div>

          <FormField name="interest" error={errors.interest}>
            <FormLabel required>Service Interest</FormLabel>
            <Select name="interest" required options={serviceOptions} />
            <FormMessage />
          </FormField>

          <FormField name="message" error={errors.message}>
            <FormLabel required>Inquiry Message</FormLabel>
            <Textarea
              name="message"
              required
              rows={5}
              placeholder="What are you building, launching, or repositioning?"
            />
            <FormMessage />
          </FormField>

          <FormField name="consent" error={errors.consent}>
            <Checkbox
              name="consent"
              required
              label={
                <span>
                  I agree to be contacted by UPRISE regarding this inquiry.{" "}
                  <span className="text-red-400" aria-hidden="true">
                    *
                  </span>
                </span>
              }
            />
            <FormMessage />
          </FormField>

          <Button type="submit" loading={mutation.isPending} className="gap-2 px-6 py-3 w-fit">
            Submit Inquiry <Send size={17} aria-hidden="true" />
          </Button>

          {mutation.isSuccess && (
            <p className="text-sm font-semibold text-gold" role="status">
              Inquiry captured. Lead status: {mutation.data.status}.
            </p>
          )}
          {mutation.isError && (
            <p className="text-sm font-semibold text-red-400" role="alert">
              {mutation.error.message}
            </p>
          )}
        </Form>
      </div>
    </section>
  );
}
