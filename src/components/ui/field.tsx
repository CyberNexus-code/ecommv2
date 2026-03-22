import { ReactNode } from "react";

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="grid gap-2 border-b border-rose-100/80 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[170px_1fr] sm:items-start">
      <div>
        <p className="text-sm font-medium text-rose-800">{label}</p>
        {hint ? <p className="text-xs text-stone-500">{hint}</p> : null}
      </div>
      <div className="sm:justify-self-end sm:text-right">{children}</div>
    </div>
  );
}
