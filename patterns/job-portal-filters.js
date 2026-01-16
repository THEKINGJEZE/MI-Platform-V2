/**
 * Job Portal URL Filters
 *
 * Regex patterns to filter out job portal pages from news/signal scrapers.
 * These patterns identify URLs that are job listings, not actual news.
 *
 * Source: DEC-309 in MI-Platform-Fresh-Start DECISIONS-FORMAL.md
 * Problem: Google News scraper picked up "Careers" pages as news (80% false positives)
 * Solution: URL regex exclusion filter runs BEFORE AI classification
 *
 * @see docs/GUARDRAILS.md G-010
 */

/**
 * Patterns that indicate a URL is a job portal, not news content.
 * If ANY pattern matches the URL, reject it from news processing.
 */
const JOB_PORTAL_PATTERNS = [
  /careers/i,
  /jobs/i,
  /vacancies/i,
  /recruitment/i,
  /apply-now/i,
  /job-search/i,
  /work-for-us/i,
  /join-us/i,
  /current-opportunities/i
];

/**
 * Check if a URL should be filtered out as a job portal.
 *
 * @param {string} url - URL to check
 * @returns {Object} { reject: boolean, reason: string|null }
 *
 * @example
 * filterJobPortalUrl('https://kent.police.uk/careers/vacancies')
 * // Returns { reject: true, reason: 'Job portal: /careers/i' }
 *
 * filterJobPortalUrl('https://bbc.co.uk/news/kent-police-investigation')
 * // Returns { reject: false, reason: null }
 */
function filterJobPortalUrl(url) {
  if (!url) {
    return { reject: false, reason: null };
  }

  for (const pattern of JOB_PORTAL_PATTERNS) {
    if (pattern.test(url)) {
      return {
        reject: true,
        reason: `Job portal: ${pattern.toString()}`
      };
    }
  }

  return { reject: false, reason: null };
}

/**
 * Filter an array of URLs/items, removing job portal matches.
 *
 * @param {Array} items - Array of items with url field
 * @param {string} urlField - Name of the field containing URL (default: 'url')
 * @returns {Object} { passed: Array, rejected: Array }
 */
function filterNewsItems(items, urlField = 'url') {
  const passed = [];
  const rejected = [];

  for (const item of items) {
    const url = item[urlField] || item.json?.[urlField];
    const result = filterJobPortalUrl(url);

    if (result.reject) {
      rejected.push({
        ...item,
        rejectionReason: result.reason
      });
    } else {
      passed.push(item);
    }
  }

  return { passed, rejected };
}

module.exports = {
  JOB_PORTAL_PATTERNS,
  filterJobPortalUrl,
  filterNewsItems
};
