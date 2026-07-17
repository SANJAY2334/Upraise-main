import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
};

export default function Dialog({ open, title, onClose, children, maxWidth = "2xl" }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      // Focus first focusable item
      const focusable = dialogRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
      if (focusable && focusable.length > 0) {
        // Find one that is not the close button if possible, else the first
        const firstInput = Array.from(focusable).find(
          (el) => el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT"
        );
        if (firstInput) {
          (firstInput as HTMLElement).focus();
        } else {
          (focusable[0] as HTMLElement).focus();
        }
      }
    } else {
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
      if (e.key === "Tab" && open && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
        if (focusable.length > 0) {
          const first = focusable[0] as HTMLElement;
          const last = focusable[focusable.length - 1] as HTMLElement;
          if (e.shiftKey && document.activeElement === first) {
            last.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const maxWStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl"
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[200] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
        >
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-start justify-center p-4 pt-20">
            <motion.div
              ref={dialogRef}
              className={`premium-border relative z-10 w-full bg-surface p-6 shadow-gold ${maxWStyles[maxWidth]}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <p id="dialog-title" className="font-display text-2xl font-semibold text-ink">
                  {title}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="focus-ring text-muted hover:text-ink"
                  aria-label="Close dialog"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6">{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Backwards-compatible FormModal mapper
export function FormModal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <Dialog open={true} title={title} onClose={onClose}>
      {children}
    </Dialog>
  );
}
export { Dialog as Modal };
