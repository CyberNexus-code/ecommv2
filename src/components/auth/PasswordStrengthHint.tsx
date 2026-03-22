"use client";

import { evaluatePasswordStrength } from "@/lib/auth/passwordStrength";

type PasswordStrengthHintProps = {
  password: string;
};

export default function PasswordStrengthHint({ password }: PasswordStrengthHintProps) {
  if (!password) return null;

  const { level, hints } = evaluatePasswordStrength(password);

  const colorClass =
    level === "Strong"
      ? "text-emerald-700"
      : level === "Fair"
      ? "text-amber-700"
      : "text-red-600";

  return (
    <div className="mt-1 text-left">
      <p className={`text-xs font-medium ${colorClass}`}>Strength: {level}</p>
      {level !== "Strong" && hints.length > 0 ? (
        <p className="text-xs text-stone-500">{hints[0]}</p>
      ) : (
        <p className="text-xs text-stone-500">Great password.</p>
      )}
    </div>
  );
}
