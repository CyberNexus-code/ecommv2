import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Read the basic privacy terms for how Cute & Creative Toppers uses, stores, and protects the limited customer information needed to run the shop.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-[1.75rem] border border-rose-100 bg-white/95 p-5 shadow-[0_14px_40px_-30px_rgba(190,24,93,0.45)] md:p-6">
      <h2 className="text-xl font-semibold text-rose-950">{title}</h2>
      <div className="space-y-3 text-sm leading-6 text-stone-700 md:text-base md:leading-7">{children}</div>
    </section>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 md:px-6 md:py-10">
      <header className="space-y-3 rounded-[2rem] border border-rose-100 bg-[linear-gradient(135deg,rgba(255,241,242,0.95),rgba(255,255,255,0.98))] p-6 shadow-[0_18px_50px_-34px_rgba(190,24,93,0.45)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">Legal</p>
        <h1 className="text-3xl font-semibold tracking-tight text-rose-950 md:text-4xl">Privacy Policy</h1>
        <p className="max-w-3xl text-sm leading-6 text-stone-700 md:text-base md:leading-7">
          This Privacy Policy explains the limited customer information Cute & Creative Toppers collects to run the
          website, process orders, and communicate with customers. We operate in South Africa and aim to handle
          personal information in a manner consistent with the Protection of Personal Information Act, 2013 (POPIA).
        </p>
        <p className="text-xs text-stone-500">Last updated: 2 April 2026</p>
      </header>

      <Section title="Who We Are">
        <p>
          Cute & Creative Toppers is a South African handmade celebration brand based in Amanzimtoti, KwaZulu-Natal.
          We create and sell custom cake toppers, party decor, and related celebration items.
        </p>
      </Section>

      <Section title="Information We Collect">
        <p>We may collect the following categories of personal information:</p>
        <ul className="list-disc pl-5">
          <li>identity and contact details such as your name, email address, and phone number if you provide one;</li>
          <li>delivery details such as street address, city, and postal code for order fulfilment;</li>
          <li>account information such as login credentials and account preferences;</li>
          <li>order and transaction information such as products ordered, pricing, delivery details, and order history;</li>
          <li>communications you send to us through forms, email, or customer support requests;</li>
          <li>limited technical information needed to keep the website working securely.</li>
        </ul>
      </Section>

      <Section title="How We Use Personal Information">
        <p>We use personal information to:</p>
        <ul className="list-disc pl-5">
          <li>create and manage customer accounts;</li>
          <li>process, fulfil, ship, and support orders;</li>
          <li>communicate about enquiries, quotations, custom requests, and order updates;</li>
          <li>maintain internal records, accounting records, and audit trails;</li>
          <li>detect misuse, secure the platform, and improve the website and services;</li>
          <li>comply with legal, tax, accounting, and regulatory obligations.</li>
        </ul>
      </Section>

      <Section title="Lawful Basis and POPIA Context">
        <p>
          Where applicable, we process personal information because it is necessary to conclude or perform a contract
          with you, because you have consented, because we have a legitimate business purpose, or because we must
          comply with a legal obligation.
        </p>
      </Section>

      <Section title="Sharing Information">
        <p>We may share information only where reasonably necessary, including with:</p>
        <ul className="list-disc pl-5">
          <li>service providers that help us host the website or store application data;</li>
          <li>payment, delivery, courier, or fulfilment service providers involved in processing your order;</li>
          <li>professional advisers or regulators where required for legal, accounting, or compliance reasons.</li>
        </ul>
        <p>We do not sell your personal information, and we do not share it for advertising or marketing purposes.</p>
      </Section>

      <Section title="Retention of Information">
        <p>
          We retain personal information only for as long as reasonably necessary for the purpose it was collected, or
          for as long as required by law, accounting, tax, fraud-prevention, or audit obligations.
        </p>
        <p>
          If you request account deletion through the application, your profile data may be anonymised while order,
          payment, and related business records are retained where necessary for legal and financial record-keeping.
        </p>
      </Section>

      <Section title="Security">
        <p>
          We use reasonable technical and organisational measures to protect personal information against loss,
          unauthorised access, misuse, alteration, or disclosure. No internet-based system can be guaranteed fully
          secure, so you use the service with that limitation in mind.
        </p>
      </Section>

      <Section title="Cookies and Technical Data">
        <p>
          The website only uses essential technical storage and related functionality needed for authentication,
          basket continuity, and secure operation. We do not use cookies for advertising or marketing purposes.
        </p>
      </Section>

      <Section title="Your Rights">
        <p>Subject to applicable law, you may have the right to request access to, correction of, or deletion of personal information.</p>
        <p>
          You may also object to certain processing or request that we limit processing where the law allows. Some
          requests may be limited where we must retain data for contractual, legal, accounting, or fraud-prevention
          reasons.
        </p>
      </Section>

      <Section title="Children">
        <p>
          This site is intended for customers capable of placing lawful purchases. If you believe a child has provided
          personal information without proper consent, contact us so that we can review and address the situation.
        </p>
      </Section>

      <Section title="Policy Updates">
        <p>
          We may update this policy from time to time. The updated version will be published on this page together with
          an updated effective or revision date.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          If you have privacy-related questions or requests, contact Cute & Creative Toppers through the website contact
          page before placing or after completing an order.
        </p>
      </Section>
    </div>
  )
}