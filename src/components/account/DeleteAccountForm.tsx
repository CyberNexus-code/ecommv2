"use client";

import { deleteOwnAccount } from "@/app/_actions/authActions";

export default function DeleteAccountForm() {
  return (
    <form
      action={deleteOwnAccount}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Permanently delete your account? This cannot be undone. Your order history will be preserved but all personal data will be removed."
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
      >
        Delete My Account
      </button>
    </form>
  );
}
