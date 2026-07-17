import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Loader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1250);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-obsidian"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
        >
          <motion.div
            className="relative overflow-hidden"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <img src="/uprise-logo.svg" alt="UPRISE" className="h-16 w-auto" />
            <motion.div
              className="absolute inset-y-0 -left-20 w-16 bg-gradient-to-r from-transparent via-gold-bright/60 to-transparent"
              animate={{ x: 310 }}
              transition={{ delay: 0.25, duration: 0.85, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
