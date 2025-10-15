/**
 * Check if a domain is allowed based on the allowed domains list
 * @param requestOrigin - The origin from the request header
 * @param allowedDomains - Array of allowed domains (supports wildcards)
 * @returns true if allowed, false otherwise
 */
export function isDomainAllowed(
  requestOrigin: string | null,
  allowedDomains: string[] | null | undefined
): boolean {
  // If no restrictions, allow all
  if (!allowedDomains || allowedDomains.length === 0) {
    return true
  }

  // If no origin provided, block by default
  if (!requestOrigin) {
    return false
  }

  // Extract hostname from origin
  let requestHostname: string
  try {
    const url = new URL(requestOrigin)
    requestHostname = url.hostname
  } catch {
    // If origin is not a valid URL, try to use it directly as hostname
    requestHostname = requestOrigin
  }

  // Check against each allowed domain
  return allowedDomains.some((allowedDomain) => {
    // Wildcard: allow all
    if (allowedDomain === '*') {
      return true
    }

    // Wildcard subdomain: *.example.com
    if (allowedDomain.startsWith('*.')) {
      const baseDomain = allowedDomain.slice(2) // Remove "*."
      // Match if hostname ends with .example.com or is example.com
      return (
        requestHostname === baseDomain ||
        requestHostname.endsWith('.' + baseDomain)
      )
    }

    // Exact match
    return requestHostname === allowedDomain
  })
}

/**
 * Get the appropriate CORS headers based on allowed domains
 * @param requestOrigin - The origin from the request header
 * @param allowedDomains - Array of allowed domains
 * @returns CORS headers object
 */
export function getCorsHeaders(
  requestOrigin: string | null,
  allowedDomains: string[] | null | undefined
): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // If no restrictions, allow all origins
  if (!allowedDomains || allowedDomains.length === 0) {
    headers['Access-Control-Allow-Origin'] = '*'
  } else if (requestOrigin && isDomainAllowed(requestOrigin, allowedDomains)) {
    // If domain is allowed, set specific origin (required for credentials)
    headers['Access-Control-Allow-Origin'] = requestOrigin
    headers['Access-Control-Allow-Credentials'] = 'true'
  }
  // If domain not allowed, don't set Access-Control-Allow-Origin header

  return headers
}
