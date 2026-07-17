import { motion } from "framer-motion";

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

export default function WhoSection() {
  return (
    <section id="who" className="border-y border-border bg-surface py-20">
      <motion.div
        className="container-shell grid gap-10 lg:grid-cols-[.85fr_1.15fr]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={reveal}
      >
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-gold">Who We Are</p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-ink sm:text-5xl">
            A premium advisory and media partner for visible brands.
          </h2>
        </div>
        <div className="grid gap-6 text-base leading-8 text-muted">
          <p>
            UPRISE is built for organizations where the stakes are public: launches, category entries, leadership
            reputation, partner confidence, and high-visibility campaigns.
          </p>
          <p>
            The platform combines strategic consulting discipline with event media speed and promotion accountability,
            giving leadership teams a single partner for story, execution, and proof.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
