import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastMessage = { id: number; type: "success" | "error"; text: string };
type ToastContextValue = { toast: (type: "success" | "error", text: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((type: "success" | "error", text: string) => {
    const id = Date.now();
    setMessages((prev) => [...prev, { id, type, text }]);
    setTimeout(() => setMessages((prev) => prev.filter((m) => m.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed right-5 top-24 z-[200] flex flex-col gap-2" aria-live="polite">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className={`flex items-center gap-3 rounded-sm border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur-md ${
                m.type === "success"
                  ? "border-gold/40 bg-surface text-gold"
                  : "border-red-500/40 bg-surface text-red-300"
              }`}
            >
              {m.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {m.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.toast;
}
