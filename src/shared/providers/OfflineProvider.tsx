import { AnimatePresence, motion } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type OfflineContextType = {
  isOffline: boolean;
};

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showStatusNotification, setShowStatusNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<"offline" | "online" | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setNotificationType("online");
      setShowStatusNotification(true);
      const timer = setTimeout(() => {
        setShowStatusNotification(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setNotificationType("offline");
      setShowStatusNotification(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <OfflineContext.Provider value={{ isOffline }}>
      {children}

      {/* Floating Offline/Online Status Notification */}
      <AnimatePresence>
        {showStatusNotification && notificationType && (
          <motion.div
            className="fixed bottom-6 left-6 z-[300] flex items-center gap-3 rounded-sm border p-4 shadow-lg backdrop-blur-md"
            style={{
              backgroundColor: notificationType === "offline" ? "rgba(220, 38, 38, 0.9)" : "rgba(22, 163, 74, 0.9)",
              borderColor: notificationType === "offline" ? "rgba(239, 68, 68, 0.5)" : "rgba(34, 197, 94, 0.5)",
              color: "#ffffff"
            }}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="alert"
            aria-live="assertive"
          >
            {notificationType === "offline" ? (
              <>
                <WifiOff size={18} aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold">You are offline</p>
                  <p className="text-xs text-white/80 mt-0.5">
                    Displaying cached content. Reconnecting when connection returns.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Wifi size={18} aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold">Back online</p>
                  <p className="text-xs text-white/80 mt-0.5">Connection re-established. Syncing changes...</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error("useOffline must be used within an OfflineProvider");
  }
  return context;
}
