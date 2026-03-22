"use client";

import { deleteOwnAccount } from "@/app/_actions/authActions";

export default function DeleteAccountForm() {
  return (
    <form
      action={deleteOwnAccount}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Delete your account? Your personal profile data will be anonymized and you will be signed out."
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
