import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button, Input, Form, FormField, FormLabel, FormMessage, useToast } from "../shared/components";
import { useAuth } from "../shared/providers";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters long.")
});

export default function ChangePasswordPage() {
  const { changePassword } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitError("");

    const data = new FormData(e.currentTarget);
    const currentPassword = String(data.get("currentPassword") || "");
    const newPassword = String(data.get("newPassword") || "");

    const result = changePasswordSchema.safeParse({ currentPassword, newPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) {
          fieldErrors[String(issue.path[0])] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast("success", "Password changed successfully. Please log in with your new password.");
      navigate("/admin/login");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

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
          <p className="mt-4 text-sm text-muted">Forced Security Reset</p>
        </div>

        <Form
          onSubmit={handleSubmit}
          className="premium-border bg-surface/80 p-8 shadow-gold backdrop-blur-md"
          noValidate
        >
          <h1 className="mb-2 font-display text-2xl font-semibold text-white">Change Password</h1>
          <p className="mb-6 text-xs text-muted">
            You are logging in with a temporary password. You must update your password to proceed.
          </p>

          <div className="grid gap-4">
            <FormField name="currentPassword" error={errors.currentPassword}>
              <FormLabel required>Current Temporary Password</FormLabel>
              <Input
                id="current-password"
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                leftIcon={<Lock size={16} />}
                placeholder="••••••••"
              />
              <FormMessage />
            </FormField>

            <FormField name="newPassword" error={errors.newPassword}>
              <FormLabel required>New Secure Password</FormLabel>
              <Input
                id="new-password"
                name="newPassword"
                type="password"
                required
                autoComplete="new-password"
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
            id="change-pwd-btn"
            type="submit"
            loading={loading}
            className="mt-6 w-full px-6 py-3 text-sm font-extrabold"
          >
            Update Password
          </Button>
        </Form>
      </motion.div>
    </main>
  );
}
