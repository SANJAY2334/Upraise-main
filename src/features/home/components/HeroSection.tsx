import { motion } from "framer-motion";
import { ArrowRight, Check, Play } from "lucide-react";
import { Button, Card } from "../../../shared/components";

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

export default function HeroSection() {
  return (
    <section id="home" className="noise relative min-h-screen overflow-hidden pt-20">
      <div className="absolute inset-0 -z-10 bg-background">
        <img
          src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=84"
          alt="Executive strategy room"
          className="h-full w-full object-cover opacity-20 dark:opacity-28"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/90 to-obsidian/60" />
      </div>
      <div className="container-shell grid min-h-[calc(100vh-80px)] content-center gap-12 py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-3 border border-gold/30 bg-background/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-gold">
            Founder-led strategic platform
          </div>
          <h1 className="mt-7 max-w-4xl font-display text-5xl font-bold leading-[1.04] text-ink sm:text-6xl lg:text-7xl">
            Elevating Brands Through Strategy, Media & Impact
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
            UPRISE aligns executive advisory, event media, promotions, and campaign strategy into one premium growth
            experience for brands that need authority, not noise.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href="#contact">
              <Button className="gap-2 px-6 py-3">
                Begin a Mandate <ArrowRight size={18} aria-hidden="true" />
              </Button>
            </a>
            <a href="#work">
              <Button
                variant="secondary"
                className="gap-2 px-6 py-3 border border-border text-ink hover:text-gold hover:border-gold/60"
              >
                View Work <Play size={17} aria-hidden="true" />
              </Button>
            </a>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
        >
          <Card className="bg-surface/80 backdrop-blur-md">
            <div className="border-b border-border pb-5">
              <p className="text-sm uppercase tracking-[0.22em] text-gold">Strategic Operating Model</p>
              <p className="mt-3 font-display text-3xl font-semibold text-ink">
                Narrative, media, execution, measurement.
              </p>
            </div>
            <div className="mt-5 grid gap-4">
              {[
                "Founder profile system",
                "Campaign command room",
                "Premium event content engine",
                "Lead and authority funnel"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-muted">
                  <Check className="text-gold" size={18} aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
