import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { Loader, Header, Footer, CookieConsent, ToastProvider, ErrorBoundary } from "./shared/components";
import { AuthProvider, useAuth, OfflineProvider } from "./shared/providers";

// Route-level code splitting using React.lazy for non-landing pages
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const PolicyPage = lazy(() => import("./pages/PolicyPage"));

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { state } = useAuth();
  if (state.status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-obsidian" role="status" aria-label="Loading session">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }
  if (state.status === "unauthenticated") {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <OfflineProvider>
          <ToastProvider>
            {/* Skip-to-content link for WCAG AA compliance */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>

            <Loader />
            <Header />

            <AnimatePresence mode="wait">
              <Suspense
                fallback={
                  <div
                    className="grid min-h-[60vh] place-items-center bg-obsidian"
                    role="status"
                    aria-label="Loading page"
                  >
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route
                    path="/admin"
                    element={
                      <RequireAuth>
                        <AdminPage />
                      </RequireAuth>
                    }
                  />
                  <Route path="/privacy" element={<PolicyPage type="privacy" />} />
                  <Route path="/cookie-policy" element={<PolicyPage type="cookies" />} />
                  <Route path="/terms" element={<PolicyPage type="terms" />} />
                </Routes>
              </Suspense>
            </AnimatePresence>

            <Footer />
            <CookieConsent />
          </ToastProvider>
        </OfflineProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
