# 🧪 EnglEuphoria Authentication Test Checklist

## Pre-Test Configuration

### ✅ Completed Setup
- [x] Authentication UI (Login/Signup pages with soft purple gradients)
- [x] Email verification page (`/email-verification`)
- [x] Password reset page (`/reset-password`)
- [x] Welcome email edge function (`send-user-emails`)
- [x] Student & Teacher signup flows
- [x] Supabase client configuration

### 🔧 Required Configuration (Action Needed)

#### 1. **Supabase Auth Settings**
Navigate to: https://supabase.com/dashboard/project/dcoxpyzoqjvmuuygvlme/auth/providers

**Email Provider Settings:**
- [ ] Enable Email provider
- [ ] Enable "Confirm email" (recommended for production)
- [ ] Set "Confirm email" redirect URL to your app URL + `/email-verification`

**URL Configuration:**
Navigate to: https://supabase.com/dashboard/project/dcoxpyzoqjvmuuygvlme/auth/url-configuration

- [ ] Set **Site URL** to: `https://YOUR-APP-URL.lovable.app` (or your deployed URL)
- [ ] Add **Redirect URLs**:
  - `https://YOUR-APP-URL.lovable.app/**` (wildcard for all routes)
  - `https://YOUR-APP-URL.lovable.app/email-verification`
  - `https://YOUR-APP-URL.lovable.app/reset-password`
  - `https://YOUR-APP-URL.lovable.app/student-application`
  - `https://YOUR-APP-URL.lovable.app/teacher-application`

#### 2. **Email Service (Resend API)**
Navigate to: https://supabase.com/dashboard/project/dcoxpyzoqjvmuuygvlme/settings/functions

- [ ] Add secret: `RESEND_API_KEY` = (your Resend API key from resend.com)
- [ ] Verify edge function `send-user-emails` is deployed

**How to get Resend API Key:**
1. Go to https://resend.com
2. Sign up/Login
3. Navigate to API Keys
4. Create new API key
5. Copy and add to Supabase secrets

#### 3. **Optional: Google OAuth (if needed)**
Navigate to: https://supabase.com/dashboard/project/dcoxpyzoqjvmuuygvlme/auth/providers

- [ ] Enable Google provider
- [ ] Add Google Client ID
- [ ] Add Google Client Secret

---

## 🧪 Test Scenarios

### Test 1: Student Registration
**Steps:**
1. Navigate to `/signup`
2. Click "Student" option
3. Fill in the form:
   - Full Name: Test Student
   - Email: test.student@example.com (use a real email you can access)
   - Age: 12
   - Password: TestPass123!
   - Confirm Password: TestPass123!
4. Click "Create Student Account"

**Expected Results:**
- ✅ Toast notification: "Student Account Created!"
- ✅ Redirected to `/student-application`
- ✅ Email received: "Welcome to EnglEuphoria, Young Learner!"
- ✅ Email received: "Confirm Your Email" (if email confirmation is enabled)

**Troubleshooting:**
- If no redirect: Check browser console for errors
- If no email: Check Edge Function logs
- If error "requested path is invalid": Check URL Configuration in Supabase Auth

---

### Test 2: Email Verification
**Steps:**
1. Check your email inbox for "Confirm Your Email"
2. Click "Confirm Email Address" button

**Expected Results:**
- ✅ Redirected to `/email-verification`
- ✅ Shows "Email Verified! 🎉"
- ✅ Button to navigate to dashboard

**Troubleshooting:**
- If link doesn't work: Check redirect URLs in Supabase Auth settings
- If shows error: Check browser console and verify token is valid

---

### Test 3: Login
**Steps:**
1. Navigate to `/login`
2. Enter credentials:
   - Email: test.student@example.com
   - Password: TestPass123!
3. Click sign in

**Expected Results:**
- ✅ Toast notification: "Login Successful"
- ✅ Redirected to `/dashboard` (then auto-redirected based on role)
- ✅ User session created

**Troubleshooting:**
- If "Invalid credentials": Check password is correct
- If no redirect: Check AuthContext and ProtectedRoute logic
- If stuck on login: Check browser console for errors

---

### Test 4: Password Reset
**Steps:**
1. Navigate to `/login`
2. Click "Forgot password?"
3. Enter email: test.student@example.com
4. Check email inbox
5. Click reset link
6. Enter new password
7. Confirm new password
8. Submit

**Expected Results:**
- ✅ Email received: "Reset Your Password"
- ✅ Redirected to `/reset-password`
- ✅ Can set new password
- ✅ Redirected to `/login` after reset
- ✅ Can login with new password

**Troubleshooting:**
- If no email: Check Edge Function logs
- If reset fails: Check password meets requirements
- If link expired: Request new reset (links expire in 30 mins)

---

### Test 5: Teacher Registration
**Steps:**
1. Navigate to `/signup`
2. Click "Teacher" option
3. Fill in the form
4. Submit

**Expected Results:**
- ✅ Account created
- ✅ Redirected to `/teacher-application`
- ✅ Email received: "Welcome to EnglEuphoria Teaching Team!"
- ✅ Email received: "Confirm Your Email"

---

## 🔍 Monitoring & Debugging

### Edge Function Logs
Check logs here: https://supabase.com/dashboard/project/dcoxpyzoqjvmuuygvlme/functions/send-user-emails/logs

**What to look for:**
- Successful email sends
- API errors from Resend
- Missing environment variables

### Browser Console
**Common errors:**
- CORS errors → Check Supabase URL configuration
- 401 Unauthorized → Check if user is authenticated
- Network errors → Check if Supabase is accessible

### Database Users
Check registered users: https://supabase.com/dashboard/project/dcoxpyzoqjvmuuygvlme/auth/users

---

## 📊 Success Criteria

**Minimum requirements for first test:**
- ✅ User can register (student or teacher)
- ✅ User receives welcome email
- ✅ User can login with credentials
- ✅ User is redirected to correct dashboard
- ✅ Password reset works

**Nice to have:**
- ✅ Email verification works
- ✅ Profile data persists
- ✅ Sessions are maintained on refresh

---

## 🚨 Common Issues & Solutions

### Issue: "requested path is invalid"
**Solution:** Update Site URL and Redirect URLs in Supabase Auth settings

### Issue: No emails received
**Solutions:**
1. Check RESEND_API_KEY is set correctly
2. Verify Edge Function is deployed
3. Check spam/junk folder
4. Review Edge Function logs for errors
5. Verify "from" email is authorized in Resend

### Issue: Redirect to localhost:3000
**Solution:** Update Site URL in Supabase Auth settings to your actual app URL

### Issue: Can't login after signup
**Solutions:**
1. Check if email confirmation is required
2. Verify password meets requirements
3. Check AuthContext for errors
4. Verify Supabase connection

---

## 📝 Notes
- All emails use purple-themed templates matching the app design
- Passwords must be at least 6 characters
- Email verification links expire after 24 hours (Supabase default)
- Password reset links expire after 30 minutes (for security)
- The app uses Supabase Auth with email/password authentication

---

## 🎯 Ready to Test?

**Before starting tests:**
1. ✅ Configure Supabase Auth URLs (Site URL + Redirect URLs)
2. ✅ Add RESEND_API_KEY to edge function secrets
3. ✅ Enable Email provider in Supabase Auth
4. ✅ Deploy the app (if not already deployed)
5. ✅ Have a real email address ready for testing

**Then start with Test 1: Student Registration!**
