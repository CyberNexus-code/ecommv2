"use client";

import Link from "next/link";

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen p-2 md:p-20">
      <div className="m-auto min-h-80 bg-white p-6 rounded-2xl shadow-sm text-center space-y-4 md:max-w-110">
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
