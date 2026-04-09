import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Read the terms governing use of the Cute & Creative Toppers website, custom orders, and online purchases in South Africa.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-[1.75rem] border border-rose-100 bg-white/95 p-5 shadow-[0_14px_40px_-30px_rgba(190,24,93,0.45)] md:p-6">
      <h2 className="text-xl font-semibold text-rose-950">{title}</h2>
      <div className="space-y-3 text-sm leading-6 text-stone-700 md:text-base md:leading-7">{children}</div>
    </section>
  )
}

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 md:px-6 md:py-10">
      <header className="space-y-3 rounded-[2rem] border border-rose-100 bg-[linear-gradient(135deg,rgba(255,241,242,0.95),rgba(255,255,255,0.98))] p-6 shadow-[0_18px_50px_-34px_rgba(190,24,93,0.45)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">Legal</p>
        <h1 className="text-3xl font-semibold tracking-tight text-rose-950 md:text-4xl">Terms of Service</h1>
        <p className="max-w-3xl text-sm leading-6 text-stone-700 md:text-base md:leading-7">
          These Terms of Service govern use of the Cute & Creative Toppers website, customer accounts, and purchases of
          products made through the platform. By using the website or placing an order, you agree to these terms.
        </p>
        <p className="text-xs text-stone-500">Last updated: 2 April 2026</p>
      </header>

      <Section title="About the Service">
        <p>
          Cute & Creative Toppers is a South African business offering handmade and custom celebration products,
          including cake toppers, party decor, and related items. Products may include made-to-order or custom elements.
        </p>
      </Section>

      <Section title="Eligibility and Accounts">
        <p>
          You must provide accurate information when creating an account, placing an order, or requesting a custom
          product. You are responsible for safeguarding your login details and for activity carried out through your
          account.
        </p>
      </Section>

      <Section title="Orders and Product Information">
        <p>
          We aim to describe products, pricing, availability, and lead times accurately. Because some products are
          handmade and customised, minor variations in colour, finish, scale, or final appearance may occur.
        </p>
        <p>
          <strong>All products are made to order and require a minimum of 14 days for fulfillment.</strong> If you need an order sooner, please contact us before placing your order to discuss possible arrangements.
        </p>
        <p>
          Submission of an order request or checkout does not guarantee acceptance. We may decline or cancel an order if
          information is incomplete, stock or production limitations arise, pricing is clearly incorrect, or fraud or
          misuse is suspected.
        </p>
      </Section>

      <Section title="Custom Orders">
        <p>
          Custom or personalised products rely on the details you supply. You are responsible for checking names,
          wording, spelling, dates, sizes, and other specification details before confirming an order.
        </p>
        <p>
          Once production on a custom item begins, changes may not be possible or may result in additional charges or
          delays.
        </p>
      </Section>

      <Section title="Pricing and Payment">
        <p>
          All prices displayed are in South African Rand unless stated otherwise. Payment may need to be completed before
          production, dispatch, or final confirmation of the order. We may correct obvious pricing errors before order
          completion or acceptance.
        </p>
      </Section>

      <Section title="Delivery and Collection">
        <p>
          <strong>Standard fulfillment time for all orders is a minimum of 14 days from the date of order confirmation.</strong> Delivery estimates are provided in good faith but are not guaranteed unless explicitly agreed otherwise. Delays
          caused by couriers, customer-supplied errors, force majeure events, or circumstances beyond reasonable control
          may affect fulfilment timelines.
        </p>
        <p>
          You are responsible for ensuring that the delivery information you provide is accurate, complete, and up to
          date. Cute & Creative Toppers is not responsible for failed, delayed, misdirected, or additional delivery
          costs caused by an incorrect or incomplete address supplied by the customer.
        </p>
      </Section>

      <Section title="Cancellations, Returns, and Refunds">
        <p>
          Because many products are customised or handmade to order, returns and refunds may be limited, especially once
          production has started. Where South African consumer law gives you non-excludable rights, those rights still
          apply.
        </p>
        <p>
          If an item arrives materially defective, incorrect, or damaged, contact us promptly through the website so the
          matter can be reviewed.
        </p>
      </Section>

      <Section title="Acceptable Use">
        <p>You agree not to misuse the website, including by:</p>
        <ul className="list-disc pl-5">
          <li>attempting unauthorised access to accounts, data, or systems;</li>
          <li>placing fraudulent, abusive, or misleading orders;</li>
          <li>uploading or submitting unlawful, harmful, or infringing content;</li>
          <li>interfering with the platform’s normal operation.</li>
        </ul>
      </Section>

      <Section title="Intellectual Property">
        <p>
          Website content, branding, copy, graphics, and product presentation remain the property of Cute & Creative
          Toppers or its licensors unless otherwise stated. You may not reproduce, distribute, or reuse website content
          without permission.
        </p>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          To the extent allowed by law, the website and products are provided on an as-available basis, and we are not
          liable for indirect, incidental, or consequential loss arising from use of the website, delayed fulfilment, or
          inability to use the service. Nothing in these terms excludes rights or remedies that cannot legally be
          excluded under South African law.
        </p>
      </Section>

      <Section title="Privacy">
        <p>
          Our handling of personal information is described in our <Link href="/privacy-policy" className="font-medium text-rose-700 hover:text-rose-800">Privacy Policy</Link>.
        </p>
      </Section>

      <Section title="Account Deletion and Record Retention">
        <p>
          If you request deletion of your account through the application, your sign-in access is removed immediately.
          We may still retain order, payment, delivery, and related business records that were already attached to an
          order where they are needed for fulfilment, customer support, returns, fraud-prevention, accounting, tax,
          audit, or other legal compliance purposes.
        </p>
      </Section>

      <Section title="Governing Framework">
        <p>
          These terms are intended for use in South Africa. Consumer, e-commerce, privacy, and other mandatory legal
          protections applicable in South Africa continue to apply where relevant.
        </p>
      </Section>

      <Section title="Changes to These Terms">
        <p>
          We may update these terms from time to time. The latest published version on this page will apply from the
          date it is posted, unless the law requires a different approach.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          If you have questions about these terms, contact Cute & Creative Toppers through the website contact page.
        </p>
      </Section>
    </div>
  )
}