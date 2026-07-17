import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Skeleton } from "../../../shared/components";

type Props = {
  services: Array<{
    title: string;
    slug: string;
    summary?: string;
    description?: string;
    deliverables: string[];
    benefits: string[];
    icon?: React.ElementType;
    story?: string;
    relatedCase?: string;
    successStories?: string[];
  }>;
  contentLoading: boolean;
};

export default function ServicesSection({ services, contentLoading }: Props) {
  const [activeService, setActiveService] = useState(services[0]?.slug ?? "");

  const active = useMemo(
    () => services.find((s) => s.slug === activeService) ?? services[0],
    [activeService, services]
  );

  // Sync active service when data loads or changes
  useEffect(() => {
    if (services.length && !services.find((s) => s.slug === activeService)) {
      setActiveService(services[0]?.slug ?? "");
    }
  }, [services, activeService]);

  return (
    <section id="services" className="py-24 border-t border-border bg-background">
      <div className="container-shell">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-gold">Core Services</p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Five connected disciplines. One strategic standard.
          </h2>
        </div>
        {contentLoading ? (
          <div className="mt-10 grid gap-4 lg:grid-cols-[360px_1fr]">
            <div className="grid gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[360px_1fr]">
            <div className="grid gap-2" role="tablist" aria-orientation="vertical" aria-label="Services List">
              {services.map((service) => {
                const Icon = service.icon;
                const isSelected = activeService === service.slug;
                return (
                  <button
                    key={service.slug}
                    type="button"
                    role="tab"
                    id={`tab-${service.slug}`}
                    aria-selected={isSelected}
                    aria-controls={`panel-${service.slug}`}
                    className={`focus-ring flex items-center gap-3 rounded-sm border p-4 text-left transition ${
                      isSelected
                        ? "border-gold bg-gold text-black"
                        : "border-border bg-surface text-ink hover:border-gold/50"
                    }`}
                    onClick={() => setActiveService(service.slug)}
                  >
                    {Icon && <Icon size={19} aria-hidden="true" />}
                    <span className="font-semibold">{service.title}</span>
                  </button>
                );
              })}
            </div>
            {active && (
              <motion.div
                key={active.slug}
                id={`panel-${active.slug}`}
                role="tabpanel"
                aria-labelledby={`tab-${active.slug}`}
                className="premium-border bg-surface p-6 sm:p-8"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm uppercase tracking-[0.18em] text-gold">Service System</p>
                <h3 className="mt-3 font-display text-4xl font-semibold text-ink">{active.title}</h3>
                <p className="mt-4 text-base leading-8 text-muted">{active.summary ?? active.description ?? ""}</p>
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="font-semibold text-ink">Deliverables</p>
                    <div className="mt-3 grid gap-2">
                      {active.deliverables.map((item) => (
                        <p key={item} className="text-sm text-muted">
                          - {item}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Benefits</p>
                    <div className="mt-3 grid gap-2">
                      {active.benefits.map((item) => (
                        <p key={item} className="text-sm text-muted">
                          - {item}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                {(active.story ?? active.successStories?.[0]) && (
                  <div className="mt-8 border-t border-border pt-6">
                    <p className="text-sm leading-7 text-muted">{active.story ?? active.successStories?.[0]}</p>
                    {active.relatedCase && (
                      <p className="mt-3 text-sm font-bold text-gold">Related case study: {active.relatedCase}</p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
