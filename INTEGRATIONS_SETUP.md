# SynCareer Integration Requirements & Setup Guide

## Overview
The SynCareer platform requires multiple integrations to function properly. This document outlines all required integrations and their configuration.

---

## 1. SUPABASE (Required - Already Connected ✅)
**Status:** Connected  
**Environment Variables:** Configured

### What it's used for:
- Authentication and user management
- Database for storing user profiles, jobs, applications, etc.
- Edge Functions hosting for AI features
- PostgreSQL backend database

### Required Tables:
The following tables need to be created in your Supabase database:
- `users` (handled by Supabase Auth)
- `student_details` (student profile data)
- `employer_details` (employer/company info)
- `counsellor_details` (counselor profile)
- `mock_interviews` (interview session data)
- `job_postings` (job listings)
- `job_applications` (application records)
- `notifications` (user notifications)
- `cv_builds` (CV builder data)

### Status:
✅ Environment variables set correctly
⚠️ Database tables: NOT YET CREATED (0 tables found)

---

## 2. ELEVENLABS (Required - For Voice Interview TTS)
**Status:** ⚠️ Needs Configuration  
**Function:** `supabase/functions/interview-tts`

### What it's used for:
- Text-to-speech for AI interview questions
- Professional voice generation for interview simulations
- Audio file generation for voice interview prep

### Required Configuration:
- **API Key:** `ELEVENLABS_API_KEY` (missing)
- **Voice ID:** Default: "JBFqnCBsd6RMkjVDRZzb" (George - professional male voice)
- **Model:** eleven_turbo_v2_5
- **Format:** MP3 at 44100Hz 128kbps

### Setup Steps:
1. Create an account at https://elevenlabs.io
2. Get your API key from the dashboard
3. Add to Vercel project environment variables:
   ```
   ELEVENLABS_API_KEY=your_api_key_here
   ```
4. Also add to local `.env` for development

### Pricing:
- Free tier: Limited API calls
- Paid: Per-character pricing (~$0.30 per 1M characters)

---

## 3. RESEND (Required - For Email Notifications)
**Status:** ⚠️ Needs Configuration  
**Function:** `supabase/functions/send-employee-invite`

### What it's used for:
- Sending employee invitation emails
- Email notifications for job updates
- Forgot password emails (when implemented)
- Professional email templating

### Required Configuration:
- **API Key:** `RESEND_API_KEY` (missing)
- **From Email:** `no-reply@syncareer.me` (needs domain verification)
- **Domain:** syncareer.me (needs DNS setup)

### Setup Steps:
1. Create account at https://resend.com
2. Verify your domain (syncareer.me) - add DNS records
3. Get your API key
4. Add to Vercel environment variables:
   ```
   RESEND_API_KEY=your_api_key_here
   ```
5. Also add to local `.env`

### Current Status:
- ⚠️ Falls back gracefully if not configured
- Invitations are recorded but emails not sent without API key

---

## 4. AI GATEWAY (Required - For AI Features)
**Status:** ⚠️ Needs Configuration  
**Functions:** 
- `supabase/functions/mock-interview` (Interview AI)
- `supabase/functions/cv-ai-assistant` (CV suggestions)
- `supabase/functions/skillbridge-chat` (AI Coach)

### What it's used for:
- AI-powered mock interviews
- CV writing assistance and suggestions
- AI career coaching
- Interview Q&A evaluation

### Current Configuration:
- **Provider:** Lovable AI Gateway
- **Model:** `google/gemini-2.5-flash`
- **Endpoint:** `https://ai.gateway.lovable.dev/v1/chat/completions`
- **API Key:** `LOVABLE_API_KEY` (missing)

### Setup Steps:
1. Get your Lovable API key from the dashboard
2. Add to Supabase Edge Functions secrets:
   ```
   LOVABLE_API_KEY=your_api_key_here
   ```
3. Verify function deployments:
   ```bash
   supabase functions deploy mock-interview
   supabase functions deploy interview-tts
   supabase functions deploy send-employee-invite
   supabase functions deploy cv-ai-assistant
   supabase functions deploy skillbridge-chat
   ```

### Pricing:
- Based on usage (tokens consumed)
- Refer to Lovable pricing dashboard

---

## 5. Optional: ChatGPT / OpenAI Direct Integration
**Status:** ⚠️ Optional (Currently using Lovable AI Gateway)
**Note:** Currently using Lovable gateway instead of direct OpenAI API

If you want direct OpenAI integration instead:
1. Create account at https://openai.com
2. Generate API key
3. Update Supabase functions to use OpenAI endpoint
4. Add `OPENAI_API_KEY` to Supabase Edge Functions secrets

---

## Environment Variables Checklist

### For Local Development (.env file):
```bash
# Supabase (Already Configured ✅)
VITE_SUPABASE_URL=https://fsorkxlcasekndigezlx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=fsorkxlcasekndigezlx

# AI Gateway (Needs Setup ⚠️)
LOVABLE_API_KEY=your_lovable_api_key

# ElevenLabs (Needs Setup ⚠️)
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Resend (Needs Setup ⚠️)
RESEND_API_KEY=your_resend_api_key
```

### For Supabase Edge Functions Secrets:
```bash
# Deploy via CLI:
supabase secrets set LOVABLE_API_KEY=your_key
supabase secrets set ELEVENLABS_API_KEY=your_key
supabase secrets set RESEND_API_KEY=your_key
```

### For Vercel Production:
Add all the above in Project Settings → Environment Variables

---

## Integration Dependencies by Feature

### 🎓 Interview Simulator (Mock Interview)
Requires:
- ✅ Supabase (database)
- ⚠️ Lovable API Gateway (AI responses)
- ⚠️ ElevenLabs (voice/TTS)
- ❌ Microphone API (browser - no setup needed)

### 📝 CV Builder
Requires:
- ✅ Supabase (storage)
- ⚠️ Lovable API Gateway (AI suggestions)

### 💬 AI Coach / Skillbridge Chat
Requires:
- ✅ Supabase (auth)
- ⚠️ Lovable API Gateway (chat responses)

### 📧 Employee Invitations
Requires:
- ✅ Supabase (auth & database)
- ⚠️ Resend (email sending)

### 💼 Employer Features
Requires:
- ✅ Supabase (database)
- ⚠️ Resend (notifications)
- ⚠️ Lovable API (hiring AI features)

---

## Testing Integrations

### 1. Test Supabase Connection
```javascript
// In browser console
const { supabase } = await import('/src/integrations/supabase/client');
const { data } = await supabase.auth.getSession();
console.log('Supabase connected:', !!data);
```

### 2. Test AI Gateway
Try creating a mock interview - will fail if LOVABLE_API_KEY missing

### 3. Test ElevenLabs
Try voice interview feature - will fall back to browser SpeechSynthesis if missing

### 4. Test Resend
Try inviting an employee - check Resend dashboard if API key is working

---

## Current Build Issue

The build is failing with generic "canceled" errors. Common causes:
1. Missing Edge Function environment variables
2. Invalid JavaScript syntax in functions
3. Missing database tables referenced by functions
4. Dependency conflicts

**Next Steps:**
1. ✅ Add all required environment variables
2. ⚠️ Create database schema/tables
3. ⚠️ Deploy Supabase Edge Functions with proper secrets
4. ✅ Test build after configuration

---

## Deployment Checklist

Before deploying to production:
- [ ] All environment variables added to Vercel
- [ ] Supabase database tables created and migrated
- [ ] Edge Functions deployed with secrets
- [ ] Email domain verified in Resend
- [ ] ElevenLabs API key tested
- [ ] AI Gateway quota sufficient
- [ ] Build completes without errors
- [ ] All features tested in staging

---

## Support Links

- **Supabase Docs:** https://supabase.com/docs
- **ElevenLabs Docs:** https://elevenlabs.io/docs
- **Resend Docs:** https://resend.com/docs
- **Lovable AI Gateway:** Check internal dashboard
- **Vercel Docs:** https://vercel.com/docs

---

Generated: $(date)
