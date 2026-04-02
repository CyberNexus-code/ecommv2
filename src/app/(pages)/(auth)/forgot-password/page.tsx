"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
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
      <div className="min-h-screen p-2 md:p-20">
        <div className="m-auto min-h-80 bg-white p-6 rounded-2xl shadow-sm text-center space-y-4 md:max-w-110">
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
    <div className="min-h-screen p-2 md:p-20">
      <form onSubmit={handleSubmit} className="m-auto min-h-80 bg-white p-6 rounded-2xl shadow-sm text-center space-y-4 md:max-w-110">
        <h1 className="text-2xl text-rose-700 font-bold">Forgot Password</h1>
        <p className="text-sm text-stone-600">
          Enter the email associated with your account to receive a password reset link.
        </p>
        
        <div className="flex flex-col items-start">
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="johnd@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <p className="text-sm text-gray-500">
            Remember your password? <Link href="/login" className="font-semibold text-rose-700">Login</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
