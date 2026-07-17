import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { useAdminLogin } from "../features/auth/hooks/useAdminLogin";
import { Button, Input, Form, FormField, FormLabel, FormMessage } from "../shared/components";

export default function AdminLoginPage() {
  const { loading, errors, submitError, handleLogin } = useAdminLogin();

  return (
    <main id="main-content" className="grid min-h-screen place-items-center bg-obsidian px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-10 text-center">
          <img src="/uprise-logo.svg" alt="UPRISE" className="mx-auto h-12 w-auto" />
          <p className="mt-4 text-sm text-muted">Admin command center</p>
        </div>

        <Form
          onSubmit={handleLogin}
          className="premium-border bg-surface/80 p-8 shadow-gold backdrop-blur-md"
          noValidate
        >
          <p className="mb-6 font-display text-2xl font-semibold text-white">Sign In</p>

          <div className="grid gap-4">
            <FormField name="email" error={errors.email}>
              <FormLabel required>Email</FormLabel>
              <Input
                id="admin-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                leftIcon={<Mail size={16} />}
                placeholder="admin@uprise.example"
              />
              <FormMessage />
            </FormField>

            <FormField name="password" error={errors.password}>
              <FormLabel required>Password</FormLabel>
              <Input
                id="admin-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                leftIcon={<Lock size={16} />}
                placeholder="••••••••"
              />
              <FormMessage />
            </FormField>
          </div>

          {submitError && (
            <p className="mt-4 rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300" role="alert">
              {submitError}
            </p>
          )}

          <Button
            id="admin-login-btn"
            type="submit"
            loading={loading}
            className="mt-6 w-full px-6 py-3 text-sm font-extrabold"
          >
            Sign In
          </Button>

          <p className="mt-5 text-center text-xs text-muted">Demo credentials: admin@uprise.example / ChangeMe123!</p>
        </Form>
      </motion.div>
    </main>
  );
}
