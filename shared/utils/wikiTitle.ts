/**
 * Wiki title validation and normalization utilities
 * Reference: https://www.mediawiki.org/wiki/Manual:Page_title
 */

// MediaWiki disallowed title characters
// Disallowed: # < > [ ] { } | _ (underscore) and control characters (0-31, 127)
const ILLEGAL_TITLE_CHARS_REGEXP = /[#<>\[\]{}|_\x00-\x1F\x7F]/

// Other invalid patterns
// - starts with colon (:)
// - contains 3+ consecutive tildes (~~~)
// - contains percent-encoded pattern (%XX)
const ILLEGAL_TITLE_PATTERNS_REGEXP = /^:|~~~|%[0-9A-Fa-f]{2}/

// Invalid characters for usernames (in addition to title restrictions)
// Usernames cannot contain: @ : > =
const INVALID_USER_NAME_CHARS_REGEXP = /[@:>=]/

/**
 * Check if a wiki title is valid
 * @param title - The title to validate
 * @returns true if valid, false otherwise
 */
export function checkWikiTitle(title: string): boolean {
  // Check if title contains any illegal characters
  if (title.match(ILLEGAL_TITLE_CHARS_REGEXP)) {
    return false
  }
  // Check if title matches any illegal patterns
  if (title.match(ILLEGAL_TITLE_PATTERNS_REGEXP)) {
    return false
  }
  return true
}

/**
 * Check if a username is valid
 * Username must be a valid wiki title and not contain additional restricted characters
 * @param userName - The username to validate
 * @returns true if valid, false otherwise
 */
export function checkUserName(userName: string): boolean {
  // Username must not contain invalid characters
  if (userName.match(INVALID_USER_NAME_CHARS_REGEXP)) {
    return false
  }
  // Username must also be a valid wiki title
  if (!checkWikiTitle(userName)) {
    return false
  }
  return true
}

/**
 * Normalize a wiki title according to MediaWiki rules
 * - Replace underscores with spaces
 * - Trim leading and trailing spaces
 * - Replace multiple consecutive spaces with a single space
 * - Capitalize the first character (for default $wgCapitalLinks = true)
 * - Convert back spaces to underscores for storage
 *
 * @param title - The title to normalize
 * @returns The normalized title
 */
export function normalizeWikiTitle(title: string): string {
  if (!title) return ''

  // Replace underscores with spaces
  let normalized = title.replace(/_/g, ' ')

  // Trim leading and trailing spaces
  normalized = normalized.trim()

  // Replace multiple consecutive spaces with a single space
  normalized = normalized.replace(/\s+/g, ' ')

  // Capitalize the first character (respecting Unicode)
  if (normalized.length > 0) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }

  // Convert spaces back to underscores for storage/comparison
  normalized = normalized.replace(/ /g, '_')

  return normalized
}

/**
 * Normalize a username (same as title normalization)
 * @param userName - The username to normalize
 * @returns The normalized username
 */
export function normalizeUserName(userName: string): string {
  return normalizeWikiTitle(userName)
}
