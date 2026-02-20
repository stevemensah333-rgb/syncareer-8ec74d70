# 🔌 SynCareer Integrations Status & Deployment Guide

## Integration Status Overview

| Integration | Service | Function | Status | Action Required |
|---|---|---|---|---|
| **AI Coach** | Lovable AI Gateway | `skillbridge-chat` | ✅ Code Ready | Add LOVABLE_API_KEY |
| **Interview Voice** | ElevenLabs TTS | `interview-tts` | ✅ Code Ready | Add ELEVENLABS_API_KEY |
| **Email Invites** | Resend | `send-employee-invite` | ✅ Code Ready | Add RESEND_API_KEY |
| **Mock Interview AI** | Lovable AI Gateway | `mock-interview` | ✅ Code Ready | Add LOVABLE_API_KEY |
| **CV AI Assistant** | Lovable AI Gateway | `cv-ai-assistant` | ⚠️ Needs Creation | Create function |
| **Database** | Supabase PostgreSQL | All features | ⚠️ Empty Schema | Create tables |
| **Authentication** | Supabase Auth | All features | ✅ Connected | No action |

---

## 📋 Complete Setup Instructions

### Phase 1: Acquire API Keys (15 minutes)

#### 1.1 Lovable AI Gateway API Key
**Used by:** Mock Interview, CV AI, AI Coach  
**Needed for:** AI-powered responses and suggestions

```bash
# Steps:
1. Open Lovable dashboard
2. Go to Settings → API Keys
3. Generate new key
4. Copy the key (starts with "sk-")
```

**Save as:** `LOVABLE_API_KEY`

#### 1.2 ElevenLabs API Key
**Used by:** Interview TTS  
**Needed for:** Voice generation for interview practice

```bash
# Steps:
1. Go to https://elevenlabs.io
2. Sign in or create account
3. Go to Settings → API keys
4. Copy the API key (starts with "sk_")
```

**Save as:** `ELEVENLABS_API_KEY`

#### 1.3 Resend API Key
**Used by:** Employee invitations & future email features  
**Needed for:** Sending professional emails

```bash
# Steps:
1. Go to https://resend.com
2. Sign in or create account
3. Go to API Keys
4. Copy your API key (starts with "re_")
```

**Save as:** `RESEND_API_KEY`

---

### Phase 2: Update Local Environment (5 minutes)

Edit `/vercel/share/v0-project/.env`:

```bash
# Replace these with your actual keys from Phase 1
LOVABLE_API_KEY=sk-your_actual_lovable_key_here
ELEVENLABS_API_KEY=sk_your_actual_elevenlabs_key_here
RESEND_API_KEY=re_your_actual_resend_key_here
```

**Test locally:**
```bash
npm run dev
# Visit http://localhost:8080
# Test AI Coach feature - should not error
```

---

### Phase 3: Create Database Schema (10 minutes)

#### Option A: Using Supabase SQL Editor (Easiest)

1. Go to Supabase Dashboard → Your Project
2. Click "SQL Editor"
3. Click "New Query"
4. Copy and paste this schema:

```sql
-- Create user profiles table
CREATE TABLE IF NOT EXISTS student_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  headline TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  phone TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employer_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT NOT NULL,
  company_size TEXT,
  industry TEXT,
  company_logo TEXT,
  website TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS counsellor_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  specialization TEXT,
  bio TEXT,
  avatar_url TEXT,
  phone TEXT,
  availability_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mock interviews table
CREATE TABLE IF NOT EXISTS mock_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_role TEXT NOT NULL,
  industry TEXT,
  difficulty TEXT DEFAULT 'intermediate',
  questions JSONB DEFAULT '[]'::jsonb,
  answers JSONB DEFAULT '[]'::jsonb,
  feedback JSONB,
  status TEXT DEFAULT 'in_progress',
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  location TEXT,
  salary_range TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CV builds table
CREATE TABLE IF NOT EXISTS cv_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  personal_info JSONB,
  education JSONB,
  experience JSONB,
  projects JSONB,
  skills JSONB,
  activities JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE student_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE counsellor_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_builds ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only see their own data)
CREATE POLICY "Users can view their own data" ON student_details
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own data" ON student_details
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data" ON student_details
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Similar policies for other tables...
```

5. Click "Run"
6. Go to Database → Tables and verify all tables appear

#### Option B: Using Supabase CLI

```bash
cd /vercel/share/v0-project

# If not already linked
supabase link

# Create migration file
supabase migration new create_schema

# Edit the migration file and paste the SQL above
supabase/migrations/[timestamp]_create_schema.sql

# Push to database
supabase db push
```

---

### Phase 4: Deploy Supabase Edge Functions (10 minutes)

#### Option A: Using CLI (Recommended)

```bash
cd /vercel/share/v0-project

# Set environment secrets
supabase secrets set LOVABLE_API_KEY=sk-your_key
supabase secrets set ELEVENLABS_API_KEY=sk_your_key
supabase secrets set RESEND_API_KEY=re_your_key

# Deploy all functions
supabase functions deploy

# Or deploy individually:
supabase functions deploy skillbridge-chat
supabase functions deploy interview-tts
supabase functions deploy send-employee-invite
supabase functions deploy mock-interview
```

#### Option B: Using Supabase Dashboard

1. Go to Supabase Dashboard → Project → Edge Functions
2. Click "Deploy a new function"
3. Upload each function code file
4. Add secrets in Settings → Secrets

---

### Phase 5: Deploy to Vercel (5 minutes)

1. **Go to Vercel Project Settings → Environment Variables**

2. **Add all three variables:**
   ```
   LOVABLE_API_KEY = sk-your_actual_key
   ELEVENLABS_API_KEY = sk_your_actual_key
   RESEND_API_KEY = re_your_actual_key
   ```

3. **Trigger New Deployment:**
   - Option A: Push to main branch
   - Option B: Click "Redeploy" in Deployments
   - Option C: Use Vercel CLI: `vercel deploy --prod`

4. **Monitor Build:**
   - Go to Deployments tab
   - Watch build logs
   - Should complete successfully now

---

## ✅ Integration Checklist

```
Phase 1: Get API Keys
□ LOVABLE_API_KEY obtained
□ ELEVENLABS_API_KEY obtained
□ RESEND_API_KEY obtained

Phase 2: Update Local .env
□ All three keys added to .env
□ Local app tested (npm run dev)
□ AI Coach works without errors

Phase 3: Database Schema
□ Tables created in Supabase
□ RLS policies configured
□ Verified in Supabase dashboard

Phase 4: Deploy Functions
□ Supabase secrets configured
□ Functions deployed
□ Logs show no errors

Phase 5: Production Deploy
□ Env vars added to Vercel
□ New deployment triggered
□ Build completed successfully

Testing
□ Sign up works
□ AI Coach responds
□ Mock interview starts
□ Employee invite sends (if Resend configured)
```

---

## 🧪 Testing Each Integration

### Test AI Coach (skillbridge-chat)
```bash
1. npm run dev
2. Navigate to AI Coach page
3. Send a message
4. Should get AI response within 10 seconds
```

### Test Interview Voice (interview-tts)
```bash
1. Start mock interview
2. AI asks first question
3. Should hear audio (or see browser TTS fallback)
4. Allow microphone when prompted
```

### Test Email Invites (send-employee-invite)
```bash
1. Log in as employer
2. Go to Team → Invite Employee
3. Enter email address
4. Check email inbox (or Resend dashboard)
5. Email should arrive within 30 seconds
```

### Test Mock Interview (mock-interview)
```bash
1. Go to Interview Simulator
2. Start new interview
3. Should get first question
4. Respond and get next question
5. Continue for 3-4 questions
```

---

## 🐛 Troubleshooting

### Build Fails with "Service not configured"
**Cause:** API keys missing from Supabase functions  
**Fix:** Run `supabase secrets set KEY=value` for each key

### AI responses are slow (>10 seconds)
**Cause:** Rate limiting or model overload  
**Fix:** Check Lovable dashboard for quota, upgrade if needed

### Email not sending
**Cause:** RESEND_API_KEY invalid or email domain not verified  
**Fix:** 
1. Verify API key in Resend dashboard
2. Add DNS records for syncareer.me domain
3. Check sender email format

### Voice not playing
**Cause:** ElevenLabs API key invalid or quota exceeded  
**Fix:**
1. Check API key
2. Check remaining credits in ElevenLabs dashboard
3. App falls back to browser TTS automatically

### Functions return 401 errors
**Cause:** User not authenticated or token expired  
**Fix:**
1. Make sure user is logged in
2. Clear browser cache
3. Sign out and sign back in

---

## 📞 Support Resources

| Integration | Documentation | Support |
|---|---|---|
| Lovable AI | Internal dashboard | Internal team |
| ElevenLabs | https://elevenlabs.io/docs | https://help.elevenlabs.io |
| Resend | https://resend.com/docs | https://resend.com/support |
| Supabase | https://supabase.com/docs | https://supabase.com/support |

---

## 🚀 What Happens After Setup

Once all integrations are configured:

✅ **AI Coach** - Users can chat with career counselor  
✅ **Interview Prep** - Full mock interview simulator with voice  
✅ **CV Assistant** - AI-powered CV writing help  
✅ **Email Notifications** - Employer invites and updates  
✅ **Smart Matching** - Jobs matched to skills  
✅ **Career Guidance** - Personalized recommendations  

---

**Status:** Ready for integration setup  
**Estimated Total Time:** 45-60 minutes  
**Difficulty:** Medium (mostly copy-paste)  
**No Coding Required:** ✅ Yes
