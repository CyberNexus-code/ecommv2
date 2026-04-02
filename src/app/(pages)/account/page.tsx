import { getUserWithProfile } from "@/lib/profiles/profiles";
import { Field } from "@/components/ui/field";
import { Section } from "@/components/ui/section";
import { InlineEdit } from "@/components/ui/inlineEdit";
import DeleteAccountForm from "@/components/account/DeleteAccountForm";
import Link from "next/link";

export default async function AccountPage() {
  const { user, profile } = await getUserWithProfile();

  if (!user) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-white p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-rose-900">Not authenticated</h2>
        <p className="mt-2 text-sm text-stone-600">
          Please log in to view and update your account details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {user.is_anonymous ? (
        <Section
          title="Guest Orders"
          description="Guest baskets and placed orders stay attached to this guest session until you sign in or create an account."
        >
          <Field label="Order Contact Email" hint="Used for receipts and order updates while you are checking out as a guest.">
            <p className="rounded-md bg-amber-50 px-3 py-1.5 text-sm text-amber-900">
              {profile?.email ?? "Add an email address below so we can send guest order updates and receipts."}
            </p>
          </Field>
        </Section>
      ) : null}

      <Section
        title="Profile Information"
        description="This information is stored on your profile and used across your orders."
      >
        <Field label="First Name" hint="Used for delivery and invoices">
          <InlineEdit
            field="first_name"
            value={profile?.first_name ?? ""}
            placeholder="Add your first name"
          />
        </Field>

        <Field label="Last Name" hint="Used for delivery and invoices">
          <InlineEdit
            field="last_name"
            value={profile?.last_name ?? ""}
            placeholder="Add your last name"
          />
        </Field>

        <Field label="Username" hint="Displayed on your account">
          <InlineEdit
            field="username"
            value={profile?.username ?? ""}
            placeholder="Choose a username"
          />
        </Field>

        <Field label="Email" hint="Primary email for order communication">
          <InlineEdit
            field="email"
            type="email"
            inputMode="email"
            value={profile?.email ?? user.email ?? ""}
            placeholder="Add an email address"
          />
        </Field>
      </Section>

      <Section
        title="Delivery Details"
        description="Keep this updated so checkout is quicker."
      >
        <Field label="Street Address">
          <InlineEdit
            field="delivery_address"
            value={profile?.delivery_address ?? ""}
            placeholder="Add a delivery address"
          />
        </Field>

        <Field label="Town / City">
          <InlineEdit
            field="city"
            value={profile?.city ?? ""}
            placeholder="Add your city"
          />
        </Field>

        <Field label="Postal Code">
          <InlineEdit
            field="postal_code"
            inputMode="numeric"
            value={String(profile?.postal_code ?? "")}
            placeholder="Add a postal code"
          />
        </Field>
      </Section>

      <Section
        title="Security & Access"
        description="Read-only sign-in details from your auth account."
      >
        <Field label="Sign-in Email">
          <p className="rounded-md bg-rose-50 px-3 py-1.5 text-sm text-rose-900">
            {user.email ?? "Not available"}
          </p>
        </Field>

        <Field label="User ID">
          <p className="rounded-md bg-rose-50 px-3 py-1.5 text-xs text-rose-800">
            {user.id}
          </p>
        </Field>

        <Field
          label="Delete Account"
          hint="This anonymizes your profile for audit retention and signs you out."
        >
          <DeleteAccountForm />
        </Field>
      </Section>

      <Section
        title="Orders"
        description={user.is_anonymous ? "Review orders placed in this guest session, or sign in to merge them into a permanent account." : "Review your placed orders and fulfillment updates."}
      >
        <Field label="Order History">
          <Link
            href="/account/orders"
            className="inline-flex rounded-md bg-rose-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-rose-800"
          >
            View My Orders
          </Link>
        </Field>
      </Section>
    </div>
  );
}
