import { useCallback } from 'react';
import DOMPurify from 'dompurify';

interface SanitizationOptions {
  allowHtml?: boolean;
  maxLength?: number;
  removeXSS?: boolean;
}

export const useInputSanitization = () => {
  const sanitizeText = useCallback((
    input: string,
    options: SanitizationOptions = {}
  ): string => {
    const {
      allowHtml = false,
      maxLength = 1000,
      removeXSS = true
    } = options;

    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Trim whitespace
    sanitized = sanitized.trim();

    // Apply length limit
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // Remove or sanitize HTML
    if (allowHtml && removeXSS) {
      // Allow safe HTML tags but remove XSS
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3'],
        ALLOWED_ATTR: []
      });
    } else if (!allowHtml) {
      // Strip all HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Remove potential XSS patterns
    if (removeXSS) {
      sanitized = sanitized
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '');
    }

    return sanitized;
  }, []);

  const sanitizeEmail = useCallback((email: string): string => {
    if (!email) return '';
    
    // Basic email sanitization
    return email
      .toLowerCase()
      .trim()
      .replace(/[^\w.@+-]/g, ''); // Only allow word chars, dots, @, +, -
  }, []);

  const sanitizePhoneNumber = useCallback((phone: string): string => {
    if (!phone) return '';
    
    // Remove all non-digit characters except + and spaces
    return phone
      .trim()
      .replace(/[^\d+\s()-]/g, '');
  }, []);

  const sanitizeUrl = useCallback((url: string): string => {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return '';
      }
      
      return urlObj.toString();
    } catch {
      return '';
    }
  }, []);

  const validateAndSanitizeFormData = useCallback((
    formData: Record<string, any>,
    rules: Record<string, SanitizationOptions & { 
      required?: boolean;
      type?: 'text' | 'email' | 'phone' | 'url' | 'number';
    }>
  ) => {
    const sanitized: Record<string, any> = {};
    const errors: Record<string, string> = {};

    Object.entries(formData).forEach(([key, value]) => {
      const rule = rules[key];
      if (!rule) {
        sanitized[key] = value;
        return;
      }

      // Check required fields
      if (rule.required && (!value || value.toString().trim() === '')) {
        errors[key] = `${key} is required`;
        return;
      }

      // Skip sanitization for empty optional fields
      if (!value && !rule.required) {
        sanitized[key] = '';
        return;
      }

      const stringValue = value.toString();

      // Type-specific sanitization
      switch (rule.type) {
        case 'email':
          sanitized[key] = sanitizeEmail(stringValue);
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (sanitized[key] && !emailRegex.test(sanitized[key])) {
            errors[key] = 'Invalid email format';
          }
          break;
          
        case 'phone':
          sanitized[key] = sanitizePhoneNumber(stringValue);
          break;
          
        case 'url':
          sanitized[key] = sanitizeUrl(stringValue);
          if (stringValue && !sanitized[key]) {
            errors[key] = 'Invalid URL format';
          }
          break;
          
        case 'number':
          const numValue = parseFloat(stringValue);
          if (isNaN(numValue)) {
            errors[key] = 'Must be a valid number';
          } else {
            sanitized[key] = numValue;
          }
          break;
          
        default:
          sanitized[key] = sanitizeText(stringValue, rule);
          break;
      }
    });

    return {
      sanitizedData: sanitized,
      errors,
      isValid: Object.keys(errors).length === 0
    };
  }, [sanitizeText, sanitizeEmail, sanitizePhoneNumber, sanitizeUrl]);

  return {
    sanitizeText,
    sanitizeEmail,
    sanitizePhoneNumber,
    sanitizeUrl,
    validateAndSanitizeFormData
  };
};