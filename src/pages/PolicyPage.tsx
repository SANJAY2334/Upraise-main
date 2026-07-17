import { useEffect } from "react";
import { Link } from "react-router-dom";
import { policyContent } from "../shared/constants";
import { applySeo } from "../shared/utils";

type PolicyType = keyof typeof policyContent;

export default function PolicyPage({ type }: { type: PolicyType }) {
  const content = policyContent[type];

  useEffect(() => {
    applySeo({
      title: `${content.title} | UPRISE`,
      description: `${content.title} for the UPRISE premium brand advisory and event media platform.`,
      path: type === "privacy" ? "/privacy" : type === "cookies" ? "/cookie-policy" : "/terms"
    });
  }, [content, type]);

  return (
    <main id="main-content" className="min-h-screen pt-32">
      <section className="container-shell max-w-4xl py-16">
        <Link to="/" className="focus-ring text-sm font-semibold text-gold">
          Back to UPRISE
        </Link>
        <h1 className="mt-6 font-display text-5xl font-semibold text-white">{content.title}</h1>
        <p className="mt-3 text-sm text-muted">{content.updated}</p>
        <div className="mt-10 grid gap-5">
          {content.sections.map((section) => (
            <p key={section} className="premium-border bg-surface p-5 text-base leading-8 text-muted">
              {section}
            </p>
          ))}
        </div>
      </section>
    </main>
  );
}
