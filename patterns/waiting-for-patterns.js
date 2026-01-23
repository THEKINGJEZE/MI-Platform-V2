/**
 * Waiting-For Detection Patterns
 *
 * Patterns to detect when a sent email expects a reply.
 * Used by WF3 (Waiting-For Tracker) to automatically track
 * emails awaiting responses.
 *
 * Pattern Categories:
 * - Explicit questions (contains '?')
 * - Request patterns ("please let me know", "could you confirm")
 * - Forward-looking expectations ("looking forward to", "hoping to hear")
 * - Call-to-action patterns ("when can we", "would you be available")
 *
 * Weight system:
 * - Each pattern has a weight (1-3)
 * - Total score calculated from all matching patterns
 * - Threshold of 2+ triggers waiting_for_reply status
 * - This prevents false positives from casual mentions
 *
 * @see SPEC-012 Section 8c (WF3: Waiting-For Tracker)
 */

/**
 * Weighted pattern definitions
 * Each pattern has: regex, weight (1-3), and description
 *
 * Weight guide:
 * - 3 = Strong indicator (explicit request for reply)
 * - 2 = Medium indicator (implies expectation of response)
 * - 1 = Weak indicator (might expect response, context dependent)
 */
const WAITING_FOR_PATTERNS = [
  // === Strong indicators (weight 3) ===

  // Explicit requests for confirmation
  {
    pattern: /could you (please )?(confirm|let me know|advise|send|share|provide)/i,
    weight: 3,
    description: 'Explicit request for action',
    example: 'Could you please confirm the meeting time?',
  },
  {
    pattern: /can you (please )?(confirm|let me know|advise|send|share|provide)/i,
    weight: 3,
    description: 'Explicit request for action',
    example: 'Can you let me know your availability?',
  },
  {
    pattern: /would you (please )?(be able to|mind|confirm|let me know)/i,
    weight: 3,
    description: 'Polite request for action',
    example: 'Would you be able to send the proposal?',
  },
  {
    pattern: /please (confirm|let me know|advise|respond|reply|get back)/i,
    weight: 3,
    description: 'Direct request',
    example: 'Please let me know if this works for you.',
  },

  // Questions expecting answers
  {
    pattern: /when (can|could|would|will) (you|we)/i,
    weight: 3,
    description: 'Scheduling question',
    example: 'When can we schedule a call?',
  },
  {
    pattern: /what (do you think|are your thoughts|would work)/i,
    weight: 3,
    description: 'Opinion request',
    example: 'What do you think about the proposal?',
  },
  {
    pattern: /do you (have|know|think)/i,
    weight: 3,
    description: 'Direct question',
    example: 'Do you have time next week?',
  },

  // === Medium indicators (weight 2) ===

  // Forward-looking expectations
  {
    pattern: /looking forward to (hearing|your|a)/i,
    weight: 2,
    description: 'Expectation of response',
    example: 'Looking forward to hearing from you.',
  },
  {
    pattern: /hoping to hear (from you|back)/i,
    weight: 2,
    description: 'Expectation of response',
    example: 'Hoping to hear from you soon.',
  },
  {
    pattern: /await(ing)? your (response|reply|feedback|thoughts)/i,
    weight: 2,
    description: 'Waiting for response',
    example: 'Awaiting your feedback.',
  },
  {
    pattern: /let me know (if|when|what|how)/i,
    weight: 2,
    description: 'Request for information',
    example: 'Let me know if you have any questions.',
  },

  // Call-to-action patterns
  {
    pattern: /would (you be |be )interested in/i,
    weight: 2,
    description: 'Interest check',
    example: 'Would you be interested in a quick call?',
  },
  {
    pattern: /happy to (discuss|chat|talk|arrange|schedule)/i,
    weight: 2,
    description: 'Offer requiring response',
    example: 'Happy to discuss further if helpful.',
  },

  // === Weak indicators (weight 1) ===

  // Generic question marks (context dependent)
  {
    pattern: /\?$/m,
    weight: 1,
    description: 'Ends with question mark',
    example: 'Does Tuesday work?',
  },

  // Soft expectations
  {
    pattern: /hope (to |this |we )/i,
    weight: 1,
    description: 'Hopeful expectation',
    example: 'Hope to connect soon.',
  },
  {
    pattern: /I('d| would) (appreciate|love|like) (to hear|your|a response)/i,
    weight: 1,
    description: 'Appreciation request',
    example: "I'd appreciate your thoughts.",
  },
];

/**
 * Negative patterns that reduce score
 * These indicate the email is NOT expecting a reply
 */
const NOT_WAITING_PATTERNS = [
  {
    pattern: /no (response|reply|action) (needed|required|necessary)/i,
    weight: -3,
    description: 'Explicit no response needed',
  },
  {
    pattern: /FYI|for your (information|records)/i,
    weight: -2,
    description: 'Informational only',
  },
  {
    pattern: /just (wanted to |to )let you know/i,
    weight: -1,
    description: 'Informational update',
  },
  {
    pattern: /thanks (for|again)|thank you (for|again)/i,
    weight: -1,
    description: 'Thank you (closing)',
  },
];

/**
 * Threshold for triggering waiting_for_reply status
 * Score must meet or exceed this threshold
 */
const WAITING_THRESHOLD = 2;

/**
 * Calculate waiting-for score for an email body
 *
 * @param {string} body - Email body text
 * @returns {object} { score: number, isWaiting: boolean, matchedPatterns: string[] }
 *
 * @example
 * calculateWaitingScore('Could you please confirm the meeting time?')
 * // { score: 3, isWaiting: true, matchedPatterns: ['Explicit request for action'] }
 *
 * @example
 * calculateWaitingScore('Thanks for the update.')
 * // { score: -1, isWaiting: false, matchedPatterns: ['Thank you (closing)'] }
 */
function calculateWaitingScore(body) {
  if (!body || typeof body !== 'string') {
    return { score: 0, isWaiting: false, matchedPatterns: [], keyRequest: null };
  }

  let score = 0;
  const matchedPatterns = [];
  const matchedSentences = [];

  // Check positive patterns
  for (const { pattern, weight, description } of WAITING_FOR_PATTERNS) {
    const match = body.match(pattern);
    if (match) {
      score += weight;
      matchedPatterns.push(description);

      // Extract the sentence containing the match for key_request
      const sentenceMatch = extractSentence(body, match.index);
      if (sentenceMatch) {
        matchedSentences.push({ sentence: sentenceMatch, weight });
      }
    }
  }

  // Check negative patterns
  for (const { pattern, weight, description } of NOT_WAITING_PATTERNS) {
    if (pattern.test(body)) {
      score += weight; // weight is negative
      matchedPatterns.push(description);
    }
  }

  // Determine the key request (highest weight matched sentence)
  const keyRequest =
    matchedSentences.length > 0
      ? matchedSentences.sort((a, b) => b.weight - a.weight)[0].sentence
      : null;

  return {
    score,
    isWaiting: score >= WAITING_THRESHOLD,
    matchedPatterns,
    keyRequest,
  };
}

/**
 * Extract the sentence containing a match
 * @private
 */
function extractSentence(text, matchIndex) {
  if (matchIndex === undefined) return null;

  // Find sentence boundaries
  const before = text.substring(0, matchIndex);
  const after = text.substring(matchIndex);

  const sentenceStart = Math.max(
    before.lastIndexOf('.') + 1,
    before.lastIndexOf('!') + 1,
    before.lastIndexOf('?') + 1,
    before.lastIndexOf('\n') + 1,
    0
  );

  const afterSentenceEnd = Math.min(
    after.indexOf('.') !== -1 ? after.indexOf('.') : after.length,
    after.indexOf('!') !== -1 ? after.indexOf('!') : after.length,
    after.indexOf('?') !== -1 ? after.indexOf('?') : after.length,
    after.indexOf('\n') !== -1 ? after.indexOf('\n') : after.length
  );

  const sentence = (
    before.substring(sentenceStart) + after.substring(0, afterSentenceEnd + 1)
  ).trim();

  return sentence.length > 0 ? sentence : null;
}

/**
 * Quick check if email is likely waiting for reply
 * Faster than full score calculation for filtering
 *
 * @param {string} body - Email body text
 * @returns {boolean} True if likely waiting for reply
 */
function isLikelyWaitingForReply(body) {
  if (!body || typeof body !== 'string') return false;

  // Quick checks for strong patterns
  const strongPatterns = [
    /could you (please )?(confirm|let me know|advise)/i,
    /can you (please )?(confirm|let me know|advise)/i,
    /please (confirm|let me know|advise|respond|reply)/i,
    /when (can|could|would) (you|we)/i,
    /looking forward to hearing/i,
  ];

  for (const pattern of strongPatterns) {
    if (pattern.test(body)) return true;
  }

  return false;
}

/**
 * n8n Code Node integration
 *
 * Returns data for the next node in format expected by Airtable
 *
 * @param {object[]} items - n8n input items
 * @returns {object[]} Items with waiting-for analysis
 */
function processForN8n(items) {
  return items.map((item) => {
    const body = item.json.body || item.json.email_body || '';
    const analysis = calculateWaitingScore(body);

    return {
      ...item,
      json: {
        ...item.json,
        waiting_score: analysis.score,
        is_waiting_for_reply: analysis.isWaiting,
        matched_patterns: analysis.matchedPatterns.join(', '),
        key_request: analysis.keyRequest,
      },
    };
  });
}

// n8n Code Node compatible exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    WAITING_FOR_PATTERNS,
    NOT_WAITING_PATTERNS,
    WAITING_THRESHOLD,
    calculateWaitingScore,
    isLikelyWaitingForReply,
    processForN8n,
  };
}
