"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PasswordStrengthHint from "@/components/auth/PasswordStrengthHint";
import { logClientError } from "@/lib/logging/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validToken, setValidToken] = useState(false);
  const [checking, setChecking] = useState(true);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  useEffect(() => {
    if (!success) {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      window.location.assign("/?reset=success");
    }, 300);

    return () => window.clearTimeout(redirectTimer);
  }, [success]);

  useEffect(() => {
    let active = true;
    let invalidTimer: ReturnType<typeof setTimeout> | undefined;

    const completeInvalid = (message: string) => {
      if (!active) return;
      setValidToken(false);
      setError(message);
      setChecking(false);
    };

    const completeValid = () => {
      if (!active) return;
      if (invalidTimer) {
        clearTimeout(invalidTimer);
      }
      setValidToken(true);
      setError(null);
      setChecking(false);
    };

    const checkSession = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (user) {
          setRecoveryEmail(user.email ?? "");
          completeValid();
          return;
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          invalidTimer = setTimeout(() => {
            completeInvalid("Invalid or expired reset link. Please request a new one.");
          }, 1500);
          return;
        }

        completeInvalid("Failed to verify reset link.");
        return;
      }

      invalidTimer = setTimeout(() => {
        completeInvalid("Invalid or expired reset link. Please request a new one.");
      }, 1500);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        if (session?.user) {
          setRecoveryEmail(session.user.email ?? "");
          completeValid();
        }
      }
    });

    checkSession();

    return () => {
      active = false;
      if (invalidTimer) {
        clearTimeout(invalidTimer);
      }
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      void logClientError("auth.resetPassword.submit", err);
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen p-2 md:p-20">
        <div className="m-auto min-h-80 bg-white p-6 rounded-2xl shadow-sm text-center space-y-4 md:max-w-110">
          <p className="text-sm text-stone-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen p-2 md:p-20">
        <div className="m-auto min-h-80 bg-white p-6 rounded-2xl shadow-sm text-center space-y-4 md:max-w-110">
          <h1 className="text-2xl text-rose-700 font-bold">Invalid Reset Link</h1>
          <p className="text-sm text-stone-600">{error}</p>
          <p className="text-sm text-gray-500">
            <Link href="/forgot-password" className="font-semibold text-rose-700">
              Request a new reset link
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen p-2 md:p-20">
        <div className="m-auto min-h-80 bg-white p-6 rounded-2xl shadow-sm text-center space-y-4 md:max-w-110">
          <h1 className="text-2xl text-rose-700 font-bold">Password Updated</h1>
          <p className="text-sm text-stone-600">
            Your password has been reset successfully.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting you to the home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 md:p-20">
      <form onSubmit={handleSubmit} className="m-auto min-h-80 bg-white p-6 rounded-2xl shadow-sm text-center space-y-4 md:max-w-110">
        <h1 className="text-2xl text-rose-700 font-bold">Reset Password</h1>
        <p className="text-sm text-stone-600">
          Enter your new password below.
        </p>

        <div className="flex flex-col items-start">
          <label className="block mb-1 text-sm font-medium">Account</label>
          <input
            type="email"
            value={recoveryEmail}
            readOnly
            autoComplete="username"
            className="border p-2 w-full rounded-md bg-rose-50 text-stone-700"
          />
        </div>

        <div className="flex flex-col items-start">
          <label className="block mb-1 text-sm font-medium">New Password</label>
          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="border p-2 w-full rounded-md"
          />
          <PasswordStrengthHint password={password} />
        </div>

        <div className="flex flex-col items-start">
          <label className="block mb-1 text-sm font-medium">Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="border p-2 w-full rounded-md"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-rose-700 text-white px-4 py-2 w-full rounded-md disabled:bg-gray-400"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          <p className="text-sm text-gray-500">
            Back to <Link href="/login" className="font-semibold text-rose-700">Login</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
