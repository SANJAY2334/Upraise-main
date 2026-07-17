import { ExternalLink } from "lucide-react";
import { Skeleton } from "../../../shared/components";

type BlogType = {
  title?: string;
  excerpt?: string;
  readTime?: string;
  category?: { name?: string } | string;
};

type Props = {
  insightsData: BlogType[];
  contentLoading: boolean;
};

export default function InsightsSection({ insightsData, contentLoading }: Props) {
  return (
    <section id="insights" className="py-24 border-t border-border bg-background">
      <div className="container-shell">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-gold">Strategic Insights</p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Authority content for founders, marketers, and leadership teams.
          </h2>
        </div>
        {contentLoading ? (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {insightsData.map((item) => (
              <article key={item.title} className="premium-border bg-surface p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                    {typeof item.category === "object" ? item.category?.name : item.category}
                    {item.readTime ? ` | ${item.readTime}` : ""}
                  </p>
                  <h3 className="mt-4 font-display text-2xl font-semibold leading-8 text-ink">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">{item.excerpt}</p>
                </div>
                <div>
                  <button
                    className="focus-ring mt-6 inline-flex items-center gap-2 text-sm font-bold text-gold"
                    type="button"
                  >
                    Read Insight <ExternalLink size={15} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
