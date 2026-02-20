# Environment Variables Setup Guide

## Overview
This guide explains how to set up all required environment variables for SynCareer to function properly on Vercel.

## Required Environment Variables

### 1. Supabase (Already Set)
These are automatically configured by the Supabase integration:

```
VITE_SUPABASE_URL=https://fsorkxlcasekndigezlx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://fsorkxlcasekndigezlx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
```

### 2. ElevenLabs (For Voice Interviews)
Required for text-to-speech functionality in interview prep.

**Steps:**
1. Go to https://elevenlabs.io/sign-up
2. Create account and verify email
3. Go to API Keys section
4. Copy your API key
5. Add to Vercel:
   ```
   ELEVENLABS_API_KEY=your_elevenlabs_key_here
   ```

### 3. Resend (For Email Notifications)
Required for sending emails (invitations, password resets, notifications).

**Steps:**
1. Go to https://resend.com/signup
2. Create account
3. Navigate to API Keys
4. Copy your API key
5. Add to Vercel:
   ```
   RESEND_API_KEY=your_resend_api_key_here
   ```

### 4. OpenAI/AI Gateway (For AI Features)
Required for AI Coach, mock interviews, and CV analysis.

**Steps:**
1. The app uses Vercel's AI Gateway by default
2. No additional configuration needed - it works with the Supabase credentials
3. AI Gateway automatically routes to the best available model

### 5. Lovable Integration (Optional)
For enhanced component tagging in development:

```
LOVABLE_API_KEY=your_lovable_api_key_here
```

## How to Add Environment Variables to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project "syncareer"
3. Click **Settings** → **Environment Variables**
4. Add each variable:
   - **Name**: `ELEVENLABS_API_KEY`
   - **Value**: Paste your ElevenLabs key
   - **Select environments**: Production, Preview, Development
   - Click **Save**
5. Repeat for `RESEND_API_KEY`

### Method 2: Vercel CLI

```bash
vercel env add ELEVENLABS_API_KEY
vercel env add RESEND_API_KEY
```

## Verifying Setup

### 1. Check Supabase Connection
- App loads without auth errors
- Login/signup works
- User data persists

### 2. Check ElevenLabs
- Go to Interview Simulator page
- Click "Enable Voice"
- Voice should generate TTS audio

### 3. Check Resend
- Go to Settings → Notification Preferences
- Enable email notifications
- Test by sending an invitation to employer
- Email should be received

### 4. Check AI Features
- Go to AI Coach
- Type a message
- Should get AI response via skillbridge-chat function

## Database Schema Setup

The database schema is defined in `supabase/init.sql`. To apply it:

1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy entire contents of `supabase/init.sql`
4. Paste and click "Run"
5. All tables should be created successfully

## Troubleshooting

### Build Failing
- Check all env vars are added to Vercel
- Run `vercel env list` to verify
- Redeploy after adding new env vars

### AI Features Not Working
- Verify `LOVABLE_API_KEY` is set in `.env`
- Check Supabase functions are deployed
- Check browser console for errors

### Email Not Sending
- Verify `RESEND_API_KEY` is correct
- Check if email is in approved domain
- Check Resend dashboard for delivery logs

### Voice Not Working
- Verify `ELEVENLABS_API_KEY` is correct
- Test on /interview-simulator page
- Check browser console for audio errors

## Production Checklist

Before deploying to production:

- [ ] All 3 API keys obtained (ElevenLabs, Resend, optional Lovable)
- [ ] Env vars added to Vercel dashboard
- [ ] Database schema created in Supabase
- [ ] Test each feature works
- [ ] Verify RLS policies prevent unauthorized access
- [ ] Check rate limits on AI Gateway

## Security Notes

- Never commit `.env` files with real keys
- Use Vercel's Environment Variables, not `.env` files
- Rotate API keys regularly
- Monitor API usage on each service's dashboard
- Use environment-specific keys (different for dev/prod if possible)
