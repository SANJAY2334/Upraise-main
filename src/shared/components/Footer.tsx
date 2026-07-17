import { Linkedin, Mail, Phone, Send } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container-shell grid gap-8 md:grid-cols-[1.2fr_.8fr_.8fr]">
        <div>
          <img src="/uprise-logo.svg" alt="UPRISE" className="h-12 w-auto" />
          <p className="mt-5 max-w-xl text-sm leading-7 text-muted">
            Premium event media, brand advisory, promotion, campaign strategy, and strategic consulting for founders and
            leadership teams.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Contact</p>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <a className="flex items-center gap-3 hover:text-ink" href="mailto:hello@uprise.example">
              <Mail size={16} aria-hidden="true" />
              hello@uprise.example
            </a>
            <a className="flex items-center gap-3 hover:text-ink" href="tel:+919000000000">
              <Phone size={16} aria-hidden="true" />
              +91 90000 00000
            </a>
            <a className="flex items-center gap-3 hover:text-ink" href="https://wa.me/919000000000">
              <Send size={16} aria-hidden="true" />
              WhatsApp
            </a>
            <a className="flex items-center gap-3 hover:text-ink" href="https://www.linkedin.com/company/uprise">
              <Linkedin size={16} aria-hidden="true" />
              LinkedIn
            </a>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Policies</p>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <Link className="hover:text-ink" to="/privacy">
              Privacy Policy
            </Link>
            <Link className="hover:text-ink" to="/cookie-policy">
              Cookie Policy
            </Link>
            <Link className="hover:text-ink" to="/terms">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
