import Image from "next/image";

import logoOnly from "./logo-only.svg";

type BuiltByBlauwbyteBadgeProps = {
  className?: string;
  compact?: boolean;
  href?: string;
  label?: string | null;
  slogan?: string;
  openInNewTab?: boolean;
};

export default function BuiltByBlauwbyteBadge({
  className,
  compact = false,
  href = "https://blauwbyte.nl",
  label = "Built by",
  slogan = "SaaS products and focused client builds.",
  openInNewTab = true,
}: BuiltByBlauwbyteBadgeProps) {
  const rootClassName = [
    "inline-flex text-left",
    compact ? "items-start gap-1.5 leading-tight" : "items-center gap-2",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const logoHeight = compact ? 20 : 28;
  const logoWidth = compact ? 19 : 27;
  const labelClassName = compact
    ? "font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]"
    : "font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]";
  const nameClassName = compact
    ? "font-[var(--font-space-grotesk)] text-[14px] font-medium tracking-[-0.02em] text-[var(--foreground)]"
    : "font-[var(--font-space-grotesk)] text-base font-semibold tracking-[-0.04em] text-[var(--foreground)]";
  const sloganClassName = compact
    ? "max-w-[18rem] text-[11px] leading-[1.35] text-[var(--muted)]"
    : "text-sm text-[var(--muted)]";

  const content = (
    <>
      <Image alt="Blauwbyte logo" height={logoHeight} src={logoOnly} width={logoWidth} />
      <span className={compact ? "flex min-w-0 flex-col gap-0.5" : "flex min-w-0 flex-col"}>
        {label ? <span className={labelClassName}>{label}</span> : null}
        <span className={nameClassName}>
          <span className="text-[#1C314F]">Blauw</span>
          <span className="text-[#4A90E2]">byte</span>
        </span>
        {slogan ? <span className={sloganClassName}>{slogan}</span> : null}
      </span>
    </>
  );

  if (!href) {
    return <div className={rootClassName}>{content}</div>;
  }

  return (
    <a
      className={rootClassName}
      href={href}
      rel={openInNewTab ? "noreferrer" : undefined}
      target={openInNewTab ? "_blank" : undefined}
    >
      {content}
    </a>
  );
}