# Security Implementation Guide

## Overview
This document outlines the security measures implemented in EnglEuphoria to protect user data and prevent common vulnerabilities.

## Authentication & Authorization

### Role-Based Access Control (RBAC)
- **CRITICAL**: Roles are stored in the `user_roles` table, NOT in localStorage or the users table
- All role checks MUST use server-side validation via `validateUserRole()` function
- Never trust client-side role information

### Server-Side Role Validation
```typescript
import { validateUserRole, isUserAdmin } from '@/utils/roleValidation';

// Always validate roles server-side
const userRole = await validateUserRole(userId);
const isAdmin = await isUserAdmin(userId);
```

### Protected Routes
All admin and teacher routes use `ImprovedProtectedRoute` which:
- Validates authentication state
- Performs server-side role validation
- Redirects unauthorized users
- Shows appropriate error messages

## Input Validation

### Client-Side Validation
All forms use Zod schemas for validation:
```typescript
import { z } from 'zod';
import { emailSchema, passwordSchema } from '@/utils/security';

const schema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
```

### Server-Side Validation
Edge functions validate all inputs:
- URL parameters (plan IDs, session IDs)
- Request body data
- File uploads
- API responses

## Security Headers

### Content Security Policy (CSP)
Configured in `src/utils/security.ts`:
- Restricts script sources
- Prevents XSS attacks
- Controls frame embedding
- Limits connection origins

### Additional Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Row Level Security (RLS)

### Database Security
All Supabase tables have RLS enabled with policies that:
- Verify user authentication
- Check user roles via security definer functions
- Prevent unauthorized data access
- Audit sensitive operations

### Security Definer Functions
Database functions use `SECURITY DEFINER` with `SET search_path = public` to:
- Prevent search_path hijacking
- Bypass RLS for trusted operations
- Maintain separation of concerns

## Data Sanitization

### HTML Sanitization
Using DOMPurify for user-generated content:
```typescript
import { sanitizeHtml } from '@/utils/security';

const clean = sanitizeHtml(userInput);
```

### XSS Prevention
- Never use `dangerouslySetInnerHTML` with unsanitized content
- Escape all user inputs before rendering
- Validate and sanitize URLs

## Rate Limiting

### Client-Side Rate Limiting
Implemented in forms to prevent abuse:
```typescript
import { rateLimiter } from '@/utils/security';

const isAllowed = rateLimiter.isAllowed(userId, 5, 60000);
```

## Security Audit Logging

### Audit Events
All security-critical actions are logged:
- Authentication attempts (login, logout, signup)
- Data access (viewing sensitive tables)
- Permission changes
- Suspicious activities

### Using Security Audit
```typescript
import { useSecurityAudit } from '@/components/security/SecurityAuditLogger';

const { logAuthEvent, logDataAccess, logSuspiciousActivity } = useSecurityAudit();

// Log authentication
logAuthEvent('login_success', 'email_password');

// Log data access
logDataAccess('teacher_profiles', profileId);

// Log suspicious activity
logSuspiciousActivity('multiple_failed_logins', { attempts: 5 });
```

## CSRF Protection

### Token Generation
CSRF tokens are generated for sensitive operations:
```typescript
import { generateCSRFToken, validateCSRFToken } from '@/utils/security';

const token = generateCSRFToken();
const isValid = validateCSRFToken(submittedToken, storedToken);
```

## Secure Form Handling

### Using useSecureForm Hook
```typescript
import { useSecureForm } from '@/hooks/useSecureForm';

const { handleSubmit, isSubmitting, errors, csrfToken } = useSecureForm({
  schema: myZodSchema,
  onSubmit: async (data) => {
    // Handle submission
  },
  rateLimitKey: 'form-submission',
});
```

## Edge Function Security

### JWT Verification
All edge functions verify JWT tokens (except public endpoints):
```toml
[functions.my-function]
verify_jwt = true
```

### Input Validation
Edge functions validate all inputs:
```typescript
if (!planId || typeof planId !== 'string' || planId.length > 100) {
  throw new Error('Invalid plan ID');
}
```

### Error Handling
Never expose sensitive information in errors:
```typescript
catch (error) {
  console.error('Internal error:', error);
  return new Response(
    JSON.stringify({ error: 'An error occurred' }),
    { status: 500 }
  );
}
```

## Common Security Pitfalls to Avoid

### ❌ DON'T
- Store roles in localStorage
- Trust client-side role checks
- Use user.role directly without validation
- Hardcode credentials
- Log sensitive data to console in production
- Use `dangerouslySetInnerHTML` without sanitization
- Disable RLS policies
- Skip input validation
- Trust URL parameters without validation

### ✅ DO
- Use server-side role validation
- Validate all inputs (client AND server)
- Sanitize user-generated content
- Enable RLS on all tables
- Use security definer functions with search_path
- Log security events
- Implement rate limiting
- Use CSRF tokens for sensitive operations
- Keep dependencies updated

## Supabase Dashboard Security Settings

### Recommended Settings
1. **Auth Settings**:
   - Enable "Leaked Password Protection"
   - Set OTP expiry to 300 seconds (5 minutes)
   - Enable "Require Email Confirmation"
   - Configure redirect URLs properly

2. **Database**:
   - Enable RLS on all public tables
   - Use security definer functions for role checks
   - Set up audit logging triggers

3. **API**:
   - Enable API rate limiting
   - Configure allowed origins (CORS)
   - Use API keys securely (never expose anon key in production for sensitive operations)

## Security Checklist

- [ ] All tables have RLS enabled
- [ ] All forms use input validation (Zod schemas)
- [ ] All edge functions validate inputs
- [ ] All edge functions verify JWT (except public endpoints)
- [ ] All role checks use server-side validation
- [ ] All user inputs are sanitized
- [ ] Security audit logging is enabled
- [ ] Rate limiting is implemented
- [ ] CSRF protection is used for sensitive forms
- [ ] Security headers are configured
- [ ] No sensitive data in console logs
- [ ] No hardcoded credentials
- [ ] Dependencies are up to date

## Incident Response

If you discover a security vulnerability:
1. Do NOT disclose it publicly
2. Document the issue privately
3. Assess the impact
4. Deploy a fix immediately
5. Review audit logs for exploitation
6. Update this documentation
7. Consider notifying affected users

## Regular Security Tasks

### Weekly
- Review security audit logs
- Check for suspicious activities
- Monitor failed authentication attempts

### Monthly
- Update dependencies
- Review and update RLS policies
- Audit edge function security
- Test input validation

### Quarterly
- Full security audit
- Penetration testing
- Review and update this documentation
- Train team on security best practices
