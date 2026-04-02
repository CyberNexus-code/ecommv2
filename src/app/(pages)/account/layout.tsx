import React from "react";
import { getUserWithProfile } from "@/lib/profiles/profiles";

export default async function AccountsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, profile } = await getUserWithProfile();

  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  const displayName =
    fullName ||
    profile?.username ||
    user?.email?.split("@")[0] ||
    "Guest";

  const accountEmail = profile?.email || user?.email || "No email on file";
  const isGuestUser = !!user?.is_anonymous;

  const completionFields = [
    profile?.first_name,
    profile?.last_name,
    profile?.username,
    profile?.email,
    profile?.delivery_address,
    profile?.city,
    profile?.postal_code,
  ];

  const completedCount = completionFields.filter(Boolean).length;
  const completion = Math.round((completedCount / completionFields.length) * 100);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
      <div className="mb-5 rounded-2xl border border-rose-200 bg-gradient-to-r from-white via-rose-50 to-rose-100/80 p-5 shadow-[0_12px_32px_-22px_rgba(190,24,93,0.7)] md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">
          My Account
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-rose-900 md:text-3xl">
          Welcome, {displayName}
        </h1>
        <p className="mt-2 text-sm text-rose-800/80">{accountEmail}</p>
        {isGuestUser ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            You are using a guest checkout account. Your order history is linked to the email saved on this profile.
          </p>
        ) : null}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_280px]">
        <div>{children}</div>
        <aside className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-500">
            Profile Completeness
          </h2>
          <p className="mt-2 text-2xl font-semibold text-rose-900">{completion}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-rose-100">
            <div
              className="h-full rounded-full bg-rose-600 transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-stone-600">
            Keep your profile up to date for faster checkout and delivery.
          </p>
        </aside>
      </div>
    </div>
  );
}
