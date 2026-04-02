"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type AccountMethod = 'google' | 'password' | 'unknown'

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [methodLoading, setMethodLoading] = useState(false);
  const [accountMethod, setAccountMethod] = useState<AccountMethod>('unknown');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailLooksValid = normalizeEmail(email).includes('@')

  async function fetchAccountMethod(targetEmail: string) {
    const normalizedEmail = normalizeEmail(targetEmail)

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setAccountMethod('unknown')
      return 'unknown' as const
    }

    setMethodLoading(true)

    try {
      const response = await fetch('/api/auth/account-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      if (!response.ok) {
        setAccountMethod('unknown')
        return 'unknown' as const
      }

      const payload = (await response.json()) as { method?: AccountMethod }
      const method = payload.method ?? 'unknown'
      setAccountMethod(method)
      return method
    } catch {
      setAccountMethod('unknown')
      return 'unknown' as const
    } finally {
      setMethodLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const detectedMethod = await fetchAccountMethod(email)

      if (detectedMethod === 'google') {
        setError('This email uses Google sign-in, so password reset is not available here. Use Continue with Google on the login page instead.')
        return
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-dvh items-start justify-center overflow-y-auto p-3 md:px-6 md:py-10">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-center shadow-sm space-y-4">
          <h1 className="text-2xl text-rose-700 font-bold">Check Your Email</h1>
          <p className="text-sm text-stone-600">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Click the link in the email to reset your password.
          </p>
          <p className="text-sm text-gray-500">
            Back to <Link href="/login" className="font-semibold text-rose-700">Login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-start justify-center overflow-y-auto p-3 md:px-6 md:py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 text-center shadow-sm space-y-4">
        <h1 className="text-2xl text-rose-700 font-bold">Forgot Password</h1>
        <p className="text-sm text-stone-600">
          Enter the email associated with your account to receive a password reset link.
        </p>
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          If this email signs in with Google, use Continue with Google on the login page instead of resetting a password.
        </p>
        
        <div className="flex flex-col items-start">
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="johnd@mail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setAccountMethod('unknown')
            }}
            onBlur={() => {
              void fetchAccountMethod(email)
            }}
            required
            className="border p-2 w-full rounded-md"
          />
          {methodLoading && emailLooksValid ? <p className="mt-1 text-xs text-stone-500">Checking sign-in method...</p> : null}
          {accountMethod === 'google' ? <p className="mt-1 text-xs text-amber-700">This email uses Google sign-in. Password reset is disabled for it here.</p> : null}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={loading || accountMethod === 'google'}
            className="bg-rose-700 text-white px-4 py-2 w-full rounded-md disabled:bg-gray-400"
          >
            {loading ? "Sending..." : accountMethod === 'google' ? "Use Google Login" : "Send Reset Link"}
          </button>
          <p className="text-sm text-gray-500">
            Remember your password? <Link href="/login" className="font-semibold text-rose-700">Login</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
