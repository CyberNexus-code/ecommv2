import { ReactNode } from "react";

type SectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-[0_10px_30px_-22px_rgba(190,24,93,0.65)] md:p-6">
      <div className="mb-4 border-b border-rose-100 pb-3">
        <h2 className="text-lg font-semibold text-rose-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-rose-700/75">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
