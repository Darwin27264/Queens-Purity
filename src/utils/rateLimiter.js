// Client-side rate limiting utility

const RATE_LIMIT_STORAGE_KEY = 'queens_purity_rate_limits';
const RATE_LIMIT_DURATION = 60 * 1000; // 1 minute in milliseconds

/**
 * Rate limit configuration for different actions
 */
const RATE_LIMITS = {
  testSubmission: {
    maxAttempts: 1,
    windowMs: RATE_LIMIT_DURATION,
    key: 'test_submission'
  },
  feedbackSubmission: {
    maxAttempts: 3,
    windowMs: RATE_LIMIT_DURATION,
    key: 'feedback_submission'
  },
  customTestCreation: {
    maxAttempts: 5,
    windowMs: RATE_LIMIT_DURATION,
    key: 'custom_test_creation'
  }
};

/**
 * Gets rate limit data from localStorage
 * @returns {Object}
 */
const getRateLimitData = () => {
  try {
    const data = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading rate limit data:', error);
    return {};
  }
};

/**
 * Saves rate limit data to localStorage
 * @param {Object} data - Rate limit data to save
 */
const saveRateLimitData = (data) => {
  try {
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving rate limit data:', error);
  }
};

/**
 * Cleans up expired rate limit entries
 * @param {Object} rateLimitData - Current rate limit data
 * @returns {Object} - Cleaned rate limit data
 */
const cleanupExpiredEntries = (rateLimitData) => {
  const now = Date.now();
  const cleaned = {};

  Object.keys(rateLimitData).forEach(key => {
    const entry = rateLimitData[key];
    if (entry && entry.expiresAt > now) {
      cleaned[key] = entry;
    }
  });

  return cleaned;
};

/**
 * Checks if an action is rate limited
 * @param {string} actionType - Type of action (testSubmission, feedbackSubmission, etc.)
 * @returns {{isAllowed: boolean, remainingAttempts: number, resetTime: number|null}}
 */
export const checkRateLimit = (actionType) => {
  const config = RATE_LIMITS[actionType];
  
  if (!config) {
    // Unknown action type, allow it but log warning
    console.warn(`Unknown rate limit action type: ${actionType}`);
    return {
      isAllowed: true,
      remainingAttempts: Infinity,
      resetTime: null
    };
  }

  const rateLimitData = cleanupExpiredEntries(getRateLimitData());
  const key = config.key;
  const entry = rateLimitData[key];
  const now = Date.now();

  if (!entry) {
    // No previous attempts, allow
    return {
      isAllowed: true,
      remainingAttempts: config.maxAttempts,
      resetTime: now + config.windowMs
    };
  }

  if (entry.expiresAt <= now) {
    // Rate limit window expired, allow
    return {
      isAllowed: true,
      remainingAttempts: config.maxAttempts,
      resetTime: now + config.windowMs
    };
  }

  if (entry.attempts >= config.maxAttempts) {
    // Rate limit exceeded
    const resetTime = entry.expiresAt;
    const remainingMs = resetTime - now;
    return {
      isAllowed: false,
      remainingAttempts: 0,
      resetTime,
      remainingSeconds: Math.ceil(remainingMs / 1000)
    };
  }

  // Within rate limit, allow
  return {
    isAllowed: true,
    remainingAttempts: config.maxAttempts - entry.attempts - 1,
    resetTime: entry.expiresAt
  };
};

/**
 * Records an action attempt for rate limiting
 * @param {string} actionType - Type of action
 */
export const recordAttempt = (actionType) => {
  const config = RATE_LIMITS[actionType];
  
  if (!config) {
    return;
  }

  const rateLimitData = cleanupExpiredEntries(getRateLimitData());
  const key = config.key;
  const now = Date.now();
  const entry = rateLimitData[key];

  if (!entry || entry.expiresAt <= now) {
    // Create new entry
    rateLimitData[key] = {
      attempts: 1,
      expiresAt: now + config.windowMs
    };
  } else {
    // Increment existing entry
    entry.attempts += 1;
  }

  saveRateLimitData(rateLimitData);
};

/**
 * Gets a user-friendly rate limit message
 * @param {Object} rateLimitResult - Result from checkRateLimit
 * @returns {string}
 */
export const getRateLimitMessage = (rateLimitResult) => {
  if (rateLimitResult.isAllowed) {
    return null;
  }

  const seconds = rateLimitResult.remainingSeconds;
  if (seconds < 60) {
    return `Please wait ${seconds} second${seconds !== 1 ? 's' : ''} before trying again.`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before trying again.`;
};

