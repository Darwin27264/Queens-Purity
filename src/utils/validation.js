// Input validation and sanitization utilities

/**
 * Validates and sanitizes a title string
 * @param {string} title - The title to validate
 * @returns {{isValid: boolean, sanitized: string, error: string|null}}
 */
export const validateTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return {
      isValid: false,
      sanitized: '',
      error: 'Title is required'
    };
  }

  const trimmed = title.trim();
  
  if (trimmed.length === 0) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Title cannot be empty'
    };
  }

  if (trimmed.length > 200) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Title must be 200 characters or less'
    };
  }

  // Sanitize: remove potentially dangerous characters but keep most special chars
  const sanitized = trimmed.replace(/[<>]/g, '');

  return {
    isValid: true,
    sanitized,
    error: null
  };
};

/**
 * Validates and sanitizes a question string
 * @param {string} question - The question to validate
 * @returns {{isValid: boolean, sanitized: string, error: string|null}}
 */
export const validateQuestion = (question) => {
  if (!question || typeof question !== 'string') {
    return {
      isValid: false,
      sanitized: '',
      error: 'Question is required'
    };
  }

  const trimmed = question.trim();
  
  if (trimmed.length === 0) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Question cannot be empty'
    };
  }

  if (trimmed.length > 500) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Question must be 500 characters or less'
    };
  }

  // Sanitize: remove potentially dangerous characters
  const sanitized = trimmed.replace(/[<>]/g, '');

  return {
    isValid: true,
    sanitized,
    error: null
  };
};

/**
 * Validates and sanitizes feedback text
 * @param {string} feedback - The feedback to validate
 * @returns {{isValid: boolean, sanitized: string, error: string|null}}
 */
export const validateFeedback = (feedback) => {
  if (!feedback || typeof feedback !== 'string') {
    return {
      isValid: false,
      sanitized: '',
      error: 'Feedback is required'
    };
  }

  const trimmed = feedback.trim();
  
  if (trimmed.length === 0) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Feedback cannot be empty'
    };
  }

  if (trimmed.length > 5000) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Feedback must be 5000 characters or less'
    };
  }

  // Sanitize: remove potentially dangerous characters
  const sanitized = trimmed.replace(/[<>]/g, '');

  return {
    isValid: true,
    sanitized,
    error: null
  };
};

/**
 * Validates a testId from URL parameters
 * @param {string} testId - The test ID to validate
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validateTestId = (testId) => {
  if (!testId || typeof testId !== 'string') {
    return {
      isValid: false,
      error: 'Invalid test ID'
    };
  }

  // Firestore document IDs are alphanumeric and can contain underscores and hyphens
  // They are typically 20 characters long
  const trimmed = testId.trim();
  
  if (trimmed.length === 0 || trimmed.length > 50) {
    return {
      isValid: false,
      error: 'Invalid test ID format'
    };
  }

  // Check for valid Firestore ID format (alphanumeric, underscore, hyphen)
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Invalid test ID format'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Validates age input
 * @param {string} age - The age string to validate
 * @returns {{isValid: boolean, age: number|null, error: string|null}}
 */
export const validateAge = (age) => {
  if (!age || age.trim() === '') {
    return {
      isValid: true, // Age is optional
      age: null,
      error: null
    };
  }

  const ageNumber = parseInt(age, 10);
  
  if (isNaN(ageNumber)) {
    return {
      isValid: false,
      age: null,
      error: 'Age must be a valid number'
    };
  }

  if (ageNumber < 13 || ageNumber > 120) {
    return {
      isValid: false,
      age: null,
      error: 'Age must be between 13 and 120'
    };
  }

  return {
    isValid: true,
    age: ageNumber,
    error: null
  };
};

