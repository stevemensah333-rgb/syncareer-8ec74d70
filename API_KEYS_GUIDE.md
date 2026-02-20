# API Keys Implementation Guide for SynCareer

## Overview
Your SynCareer application requires 3 API keys to enable all features. Here's everything you need to know.

---

## 1. ELEVENLABS_API_KEY - Voice Generation for Interviews

### What it does:
- Generates realistic AI voice responses during interview practice sessions
- Powers the "interview-tts" Supabase function
- Used in `src/hooks/useVoiceInterview.ts`

### Where it's used:
- **Feature**: Mock interviews with voice feedback
- **Supabase Function**: `supabase/functions/interview-tts/index.ts`
- **Client Hook**: `src/hooks/useVoiceInterview.ts` (line 175)

### How to get it:
1. Go to https://elevenlabs.io
2. Sign up for a free account (11,000 free characters/month)
3. Navigate to Dashboard → API Keys
4. Copy your API key

### Implementation:
```bash
# Add to your .env file:
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxx

# Or add to Vercel Project:
# Settings → Environment Variables → Add ELEVENLABS_API_KEY
```

### Code usage:
The Supabase function uses it like this:
```typescript
const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/{voice_id}', {
  method: 'POST',
  headers: {
    'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY')
  }
});
```

---

## 2. RESEND_API_KEY - Email Sending

### What it does:
- Sends employee invitation emails
- Powers password reset emails
- Sends email notifications
- Powers the "send-employee-invite" Supabase function

### Where it's used:
- **Feature**: Employer invitations, password resets, notifications
- **Supabase Function**: `supabase/functions/send-employee-invite/index.ts`
- **Client Pages**: Invite flow in employer dashboard

### How to get it:
1. Go to https://resend.com
2. Sign up for a free account
3. Navigate to API Keys
4. Copy your API key (format: `re_xxxxxxxxxxxxxxxxxxxx`)

### Implementation:
```bash
# Add to your .env file:
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Or add to Vercel Project:
# Settings → Environment Variables → Add RESEND_API_KEY
```

### Code usage:
The Supabase function uses it like this:
```typescript
const emailResponse = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'noreply@syncareer.com',
    to: email,
    subject: 'You have been invited to join SynCareer',
    html: emailTemplate
  })
});
```

---

## 3. Supabase Keys (Already Configured)

### What they do:
- Authentication and database access
- AI functions communication
- User session management

### Current values:
```
VITE_SUPABASE_URL="https://fsorkxlcasekndigezlx.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_PROJECT_ID="fsorkxlcasekndigezlx"
```

✅ **Already configured in your .env file**

---

## 4. AI Integration Keys

### OpenAI (via Vercel AI Gateway)
- Used for: Chat responses, CV analysis, interview evaluation
- **NO ADDITIONAL API KEY NEEDED** - Uses Vercel AI Gateway (zero-config)
- Used in:
  - `supabase/functions/skillbridge-chat/index.ts` - AI Coach responses
  - `supabase/functions/mock-interview/index.ts` - Interview evaluation
  - `supabase/functions/cv-ai-assistant/index.ts` - CV analysis

---

## Implementation Steps

### Step 1: Get the Keys (5-10 minutes)

**ElevenLabs:**
1. Visit https://elevenlabs.io
2. Create free account
3. Go to Dashboard → API Keys
4. Copy the API key starting with `sk_`

**Resend:**
1. Visit https://resend.com
2. Create free account
3. Go to API Keys section
4. Copy the API key starting with `re_`

### Step 2: Add to Environment

**For Local Development:**
```bash
# Edit .env file in project root
ELEVENLABS_API_KEY=sk_your_actual_key_here
RESEND_API_KEY=re_your_actual_key_here
```

**For Vercel Deployment:**
1. Go to https://vercel.com
2. Select your project (syncareer)
3. Settings → Environment Variables
4. Add two new variables:
   - Name: `ELEVENLABS_API_KEY` | Value: `sk_...`
   - Name: `RESEND_API_KEY` | Value: `re_...`
5. Click "Save"

### Step 3: Verify Setup

Run this to test locally:
```bash
npm run dev
# Visit http://localhost:5173
# Try AI Coach feature (should respond)
# Try creating interview (should generate voice)
# Try sending employee invite (should send email)
```

---

## Feature Mapping

| Feature | API Key Used | File | Status |
|---------|-------------|------|--------|
| AI Coach Chat | None (AI Gateway) | `src/pages/AICoach.tsx` | ✅ Ready |
| Mock Interview | ELEVENLABS_API_KEY | `src/hooks/useVoiceInterview.ts` | ⏳ Waiting for key |
| Interview TTS | ELEVENLABS_API_KEY | `supabase/functions/interview-tts` | ⏳ Waiting for key |
| Employee Invites | RESEND_API_KEY | `supabase/functions/send-employee-invite` | ⏳ Waiting for key |
| Password Reset | RESEND_API_KEY | Auth system | ⏳ Waiting for key |
| CV AI Assistant | None (AI Gateway) | `supabase/functions/cv-ai-assistant` | ✅ Ready |
| Portfolio Analysis | None (AI Gateway) | `supabase/functions/analyze-portfolio` | ✅ Ready |

---

## Troubleshooting

### "Invalid API key" error
- Check the key is copied completely (no extra spaces)
- Verify it matches the correct service (sk_ for ElevenLabs, re_ for Resend)
- Confirm it's added to Vercel for deployment

### Voice generation not working
- Ensure `ELEVENLABS_API_KEY` is set
- Check ElevenLabs dashboard for remaining quota
- Verify the function has permission to make API calls

### Emails not sending
- Ensure `RESEND_API_KEY` is set
- Check Resend dashboard for errors
- Verify sender email is authorized in Resend

### Free tier limits
- **ElevenLabs**: 11,000 characters/month free
- **Resend**: 100 emails/day free

---

## Next Steps

1. ✅ Get the two API keys (ElevenLabs, Resend)
2. ✅ Add them to .env locally for testing
3. ✅ Add them to Vercel for production
4. ✅ Redeploy application
5. ✅ Test all features

Once complete, your SynCareer app will be fully functional! 🚀
