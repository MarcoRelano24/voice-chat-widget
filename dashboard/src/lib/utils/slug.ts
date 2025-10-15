/**
 * Generate a random alphanumeric slug
 * @param length - Length of the slug (default: 8)
 * @returns Random slug like 'k7x2m9p4'
 */
export function generateRandomSlug(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

/**
 * Validate slug format (lowercase alphanumeric and hyphens only)
 * @param slug - The slug to validate
 * @returns true if valid
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug)
}

/**
 * Sanitize a string to be URL-safe slug
 * @param text - The text to convert
 * @returns URL-safe slug
 */
export function sanitizeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/[^a-z0-9-]+/g, '') // Remove non-alphanumeric except hyphens
    .replace(/--+/g, '-')        // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '')     // Remove leading/trailing hyphens
}
