"use client";

import Link from "next/link";

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-dvh items-start justify-center overflow-y-auto p-3 md:px-6 md:py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-center shadow-sm space-y-4">
        <h1 className="text-2xl text-rose-700 font-bold">Change Password Unavailable</h1>
        <p className="text-sm text-stone-600">
          Password change via reset link is temporarily disabled in the app.
        </p>
        <p className="text-sm text-gray-500">
          Back to <Link href="/login" className="font-semibold text-rose-700">Login</Link>
        </p>
      </div>
    </div>
  );
}
