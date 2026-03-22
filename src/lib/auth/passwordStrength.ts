export type PasswordStrengthLevel = "Very weak" | "Weak" | "Fair" | "Strong";

export type PasswordStrengthResult = {
  score: number;
  level: PasswordStrengthLevel;
  hints: string[];
};

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;
  const hints: string[] = [];

  if (password.length >= 8) score += 1;
  else hints.push("Use at least 8 characters.");

  if (password.length >= 12) score += 1;

  if (/[A-Z]/.test(password)) score += 1;
  else hints.push("Add an uppercase letter.");

  if (/[a-z]/.test(password)) score += 1;
  else hints.push("Add a lowercase letter.");

  if (/\d/.test(password)) score += 1;
  else hints.push("Add a number.");

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else hints.push("Add a special character.");

  let level: PasswordStrengthLevel = "Very weak";
  if (score >= 5) level = "Strong";
  else if (score >= 4) level = "Fair";
  else if (score >= 3) level = "Weak";

  return { score, level, hints };
}
