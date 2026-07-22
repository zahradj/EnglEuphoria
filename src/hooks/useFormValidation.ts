
import { useState } from "react";

interface ValidationErrors {
  [key: string]: string;
}

interface FormValidationRules {
  [key: string]: {
    required?: boolean;
    email?: boolean;
    minLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

export const useFormValidation = (rules: FormValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = (name: string, value: any): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    if (rule.required && (!value || value.toString().trim() === "")) {
      return "This field is required";
    }

    if (rule.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
    }

    if (rule.minLength && value && value.length < rule.minLength) {
      return `Must be at least ${rule.minLength} characters`;
    }

    if (rule.pattern && value && !rule.pattern.test(value)) {
      return "Invalid format";
    }

    if (rule.custom && value) {
      return rule.custom(value);
    }

    return null;
  };

  const validateForm = (formData: any): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const validateSingleField = (name: string, value: any) => {
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error || ""
    }));
    return !error;
  };

  const clearErrors = () => setErrors({});
  const clearFieldError = (name: string) => {
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  return {
    errors,
    validateForm,
    validateSingleField,
    clearErrors,
    clearFieldError
  };
};
