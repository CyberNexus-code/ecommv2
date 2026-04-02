"use client";

import { deleteOwnAccount } from "@/app/_actions/authActions";

type DeleteAccountFormProps = {
  activeOrderCount: number;
};

export default function DeleteAccountForm({ activeOrderCount }: DeleteAccountFormProps) {
  const hasActiveOrders = activeOrderCount > 0;
  const confirmMessage = hasActiveOrders
    ? `Permanently delete your account? You still have ${activeOrderCount} active order${activeOrderCount === 1 ? "" : "s"}. We will keep the contact and delivery details already captured on those orders so payment, fulfilment, support, and required record-keeping can continue. This cannot be undone.`
    : "Permanently delete your account? This cannot be undone. Closed order records and legally required business records may still be retained.";

  return (
    <div className="space-y-3">
      {hasActiveOrders ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          You have {activeOrderCount} active order{activeOrderCount === 1 ? "" : "s"}. Deleting your account signs you out immediately, but the contact and delivery details already stored on those orders will be retained so we can finish fulfilment, handle support, and meet record-keeping obligations.
        </p>
      ) : (
        <p className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700">
          Deleting your account removes your sign-in access immediately. Closed order, payment, and accounting records may still be retained where legally or operationally required.
        </p>
      )}

      <form
        action={deleteOwnAccount}
        onSubmit={(event) => {
          const confirmed = window.confirm(confirmMessage);

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
    </div>
  );
}
