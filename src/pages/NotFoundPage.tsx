import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main
      id="main-content"
      className="flex min-h-[70vh] flex-col items-center justify-center bg-obsidian px-6 text-center text-white"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md"
      >
        <h1 className="text-8xl font-black tracking-widest text-gold">404</h1>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Page Not Found</h2>
        <p className="mt-4 text-muted">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-3 text-sm font-extrabold text-obsidian transition-colors hover:bg-gold-light focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-obsidian"
        >
          <Home size={16} />
          Back to Home
        </Link>
      </motion.div>
    </main>
  );
}
