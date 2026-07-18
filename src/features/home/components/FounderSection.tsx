import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, Skeleton } from "../../../shared/components";
import type { ApiFounder } from "../../../shared/services/api";

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

type Props = {
  content: { founder: ApiFounder | null } | undefined;
  contentLoading: boolean;
  founderTimeline: Array<{ year: string; title: string; detail: string }>;
  founderHighlights: string[];
};

export default function FounderSection({ content, contentLoading, founderTimeline, founderHighlights }: Props) {
  const [timelineIndex, setTimelineIndex] = useState(founderTimeline.length - 1);

  // Sync timeline index when length changes
  useEffect(() => {
    setTimelineIndex(founderTimeline.length - 1);
  }, [founderTimeline.length]);

  return (
    <section id="founder" className="py-24 border-t border-border bg-background">
      <div className="container-shell">
        <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-120px" }}
            variants={reveal}
          >
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-gold">Founder Spotlight</p>
            <h2 className="mt-4 font-display text-4xl font-semibold text-ink sm:text-5xl">
              Executive counsel with campaign-floor fluency.
            </h2>
            <p className="mt-6 text-base leading-8 text-muted">
              The UPRISE founder profile is designed as the company&apos;s strongest credibility asset: part biography,
              part leadership philosophy, part record of measurable client impact.
            </p>
            <div className="mt-7 grid gap-4">
              {founderHighlights.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-muted">
                  <Star className="mt-1 shrink-0 text-gold" size={17} aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <Card className="p-5 sm:p-7 bg-surface">
            <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
              <div className="aspect-[4/5] overflow-hidden bg-black/40">
                {content?.founder?.portraitMedia ? (
                  <img
                    src={content.founder.portraitMedia.url}
                    alt="Ravi Ganeshan - UPRISE Founder"
                    className="h-full w-full object-cover grayscale"
                    loading="lazy"
                    width={400}
                    height={500}
                  />
                ) : (
                  <img
                    src="/ravi-ganeshan.jpg"
                    alt="Ravi Ganeshan - UPRISE Founder"
                    className="h-full w-full object-cover grayscale"
                    loading="lazy"
                    width={400}
                    height={500}
                  />
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gold">Founder Profile</p>
                <h2 className="mt-2 font-display text-4xl font-semibold text-ink">Ravi Ganeshan</h2>
                <h3 className="mt-3 font-display text-xl font-semibold text-ink/80">
                  {content?.founder?.title ?? "Founder, Brand Advisor & Strategic Media Architect"}
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {content?.founder?.biography ??
                    "Achievements include multi-city campaign leadership, premium launch media rooms, founder narrative systems, and advisory retainers for growth-stage leadership teams."}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-7">
              {contentLoading ? (
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-9 w-14" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2" role="tablist" aria-label="Founder Timeline Years">
                  {founderTimeline.map((item, index) => {
                    const isSelected = timelineIndex === index;
                    return (
                      <button
                        key={item.year}
                        type="button"
                        role="tab"
                        id={`timeline-tab-${item.year}`}
                        aria-selected={isSelected}
                        aria-controls={`timeline-panel-${item.year}`}
                        className={`focus-ring rounded-sm border px-4 py-2 text-sm font-bold transition ${
                          isSelected ? "border-gold bg-gold text-black" : "border-border text-muted hover:text-ink"
                        }`}
                        onClick={() => setTimelineIndex(index)}
                      >
                        {item.year}
                      </button>
                    );
                  })}
                </div>
              )}
              {founderTimeline[timelineIndex] && (
                <motion.div
                  key={founderTimeline[timelineIndex].year}
                  id={`timeline-panel-${founderTimeline[timelineIndex].year}`}
                  role="tabpanel"
                  aria-labelledby={`timeline-tab-${founderTimeline[timelineIndex].year}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <p className="font-display text-2xl font-semibold text-ink">{founderTimeline[timelineIndex].title}</p>
                  <p className="mt-3 text-sm leading-7 text-muted">{founderTimeline[timelineIndex].detail}</p>
                </motion.div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
