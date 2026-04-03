export function normalizeCategoryName(value: string): string {
  return decodeURIComponent(value)
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getCategoryPath(name: string): string {
  return `/products/${encodeURIComponent(name.trim().toLowerCase().replace(/\s+/g, '-'))}`
}

export function formatCategoryDisplayName(value: string): string {
  return normalizeCategoryName(value)
}