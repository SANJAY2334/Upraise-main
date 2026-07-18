import { Search, ExternalLink, Quote } from "lucide-react";
import { useState, useMemo } from "react";
import { Card, Skeleton, EmptyState, Input } from "../../../shared/components";

type CaseStudyType = {
  title?: string;
  category?: string;
  clientName?: string;
  client?: string;
  narrative?: string;
  challenge?: string;
  results?: string[];
  metrics?: Record<string, string>;
  image?: string;
};

type TestimonialType = {
  quote?: string;
  name?: string;
  company?: string;
  title?: string;
};

type Props = {
  clientNames: string[];
  caseStudiesData: CaseStudyType[];
  testimonialData: TestimonialType[];
  contentLoading: boolean;
};

export default function PortfolioSection({ clientNames, caseStudiesData, testimonialData, contentLoading }: Props) {
  const [search, setSearch] = useState("");

  const filteredStudies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return caseStudiesData;
    return caseStudiesData.filter((study) => {
      const title = study.title?.toLowerCase() ?? "";
      const category = study.category?.toLowerCase() ?? "";
      const client = (study.clientName ?? study.client ?? "").toLowerCase();
      return title.includes(query) || category.includes(query) || client.includes(query);
    });
  }, [search, caseStudiesData]);

  return (
    <>
      {/* Clients */}
      <section id="clients" className="border-y border-border bg-surface py-16">
        <div className="container-shell">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-gold">Companies Worked With</p>
          {contentLoading ? (
            <div className="mt-8 grid grid-cols-2 gap-px sm:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-4">
              {clientNames.map((client) => (
                <div key={client} className="bg-surface p-6 text-center font-display text-xl font-semibold text-ink">
                  {client}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Work / Case Studies */}
      <section id="work" className="py-24">
        <div className="container-shell">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-gold">Featured Case Studies</p>
              <h2 className="mt-4 font-display text-4xl font-semibold text-ink sm:text-5xl">
                Work told through context, decisions, and results.
              </h2>
            </div>
            <div className="relative max-w-sm w-full">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search featured case studies"
                leftIcon={<Search size={17} />}
                placeholder="Search portfolio"
              />
            </div>
          </div>
          {contentLoading ? (
            <div className="mt-10 grid gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-56" />
              ))}
            </div>
          ) : !filteredStudies.length ? (
            <div className="mt-10">
              <EmptyState
                icon={Search}
                title="No case studies found"
                message={`We couldn't find any case studies matching "${search}". Try checking your spelling or search queries.`}
              />
            </div>
          ) : (
            <div className="mt-10 grid gap-6">
              {filteredStudies.map((study) => (
                <article
                  key={study.title}
                  className="premium-border grid overflow-hidden bg-surface lg:grid-cols-[.85fr_1.15fr]"
                >
                  <div className="min-h-72 overflow-hidden bg-black/40">
                    {study.image ? (
                      <img
                        src={study.image}
                        alt={study.title}
                        className="h-full w-full object-cover transition duration-700 hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-muted">
                        <ExternalLink size={24} aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 sm:p-8">
                    <p className="text-sm uppercase tracking-[0.18em] text-gold">{study.category}</p>
                    <h3 className="mt-3 font-display text-3xl font-semibold text-ink">{study.title}</h3>
                    <p className="mt-2 text-sm font-semibold text-muted">{study.clientName ?? study.client}</p>
                    <p className="mt-5 text-sm leading-7 text-muted">{study.challenge ?? study.narrative}</p>
                    {study.results && study.results.length > 0 && (
                      <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        {study.results.slice(0, 3).map((metric) => (
                          <div key={metric} className="border border-border bg-black/25 p-3 text-sm text-ink">
                            {metric}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border bg-surface py-20">
        <div className="container-shell grid gap-6 md:grid-cols-2">
          {contentLoading
            ? [...Array(2)].map((_, i) => <Skeleton key={i} className="h-48" />)
            : testimonialData.map((testimonial) => (
                <Card key={testimonial.quote} className="bg-black/25 p-7">
                  <Quote className="text-gold" size={28} aria-hidden="true" />
                  <p className="mt-5 font-display text-2xl leading-9 text-ink">{testimonial.quote}</p>
                  <p className="mt-5 text-sm font-semibold text-gold">{testimonial.name}</p>
                  <p className="text-sm text-muted">{testimonial.company ?? testimonial.title}</p>
                </Card>
              ))}
        </div>
      </section>
    </>
  );
}
