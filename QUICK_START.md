# 🚀 SynCareer Integration Quick Start

## In 5 Minutes

Your app is ready to go live. Here's all you need to do:

### Step 1: Get 3 API Keys (3 min)

1. **Lovable AI**
   - Go to your Lovable dashboard
   - Copy API key

2. **ElevenLabs** 
   - Go to https://elevenlabs.io
   - Sign up/login → Settings → API Keys → Copy

3. **Resend**
   - Go to https://resend.com
   - Sign up/login → API Keys → Copy

### Step 2: Update .env File (1 min)

```bash
# Replace the placeholders in .env with your actual keys:
LOVABLE_API_KEY=sk-your_actual_key_from_step_1
ELEVENLABS_API_KEY=sk_your_actual_key_from_step_1
RESEND_API_KEY=re_your_actual_key_from_step_1
```

### Step 3: Deploy to Vercel (1 min)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the 3 variables above
3. Click "Redeploy" or push to main branch

### Step 4: Verify (Not counted in 5 min)

- ✅ Build should succeed
- ✅ Visit https://yourdomain.com
- ✅ Test AI Coach feature

---

## Full Checklist

```
GETTING API KEYS
□ Lovable AI key (for smart features)
□ ElevenLabs key (for voice)
□ Resend key (for emails)

LOCAL SETUP (15 min total)
□ Update .env with 3 keys
□ Run: npm run dev
□ Test AI Coach works

DATABASE (10 min)
□ Go to Supabase Dashboard
□ Run SQL schema (provided in INTEGRATION_DEPLOYMENT_GUIDE.md)
□ Verify 8 tables created

PRODUCTION DEPLOY (5 min)
□ Add env vars to Vercel
□ Trigger deployment
□ Verify build succeeds
□ Test features live

OPTIONAL: Resend Email (5 min)
□ Verify syncareer.me domain (if using Resend)
□ Add DNS records
□ Send test employee invite
```

---

## What Each Integration Does

| Key | What It Enables | Service | Priority |
|---|---|---|---|
| LOVABLE_API_KEY | AI Coach, Mock Interview, CV Assistant | Lovable | CRITICAL |
| ELEVENLABS_API_KEY | Voice in interviews | ElevenLabs | IMPORTANT |
| RESEND_API_KEY | Email invitations | Resend | OPTIONAL |

**Critical:** Must have LOVABLE_API_KEY or AI features won't work  
**Important:** Without ElevenLabs, interviews use browser text-to-speech  
**Optional:** Without Resend, emails won't send but app still works

---

## Troubleshooting

### "Build canceled"
→ Missing LOVABLE_API_KEY in Supabase

### "AI Coach shows error"
→ Check LOVABLE_API_KEY is correct in Vercel env vars

### "No voice in interview"
→ Check ELEVENLABS_API_KEY or allow microphone access

### "Emails not sending"  
→ Check RESEND_API_KEY and verify domain

---

## Detailed Guides

- 📖 **INTEGRATION_DEPLOYMENT_GUIDE.md** - Full step-by-step
- 📊 **PROJECT_STATUS.md** - Current status & architecture
- 🔌 **INTEGRATIONS_SETUP.md** - Technical details
- ⚠️ **REQUIRED_SETUP.md** - Critical setup checklist

---

## Success = Done in <1 Hour

With all 3 API keys, you can:
1. Get keys (15 min)
2. Update .env (5 min)
3. Deploy to Vercel (5 min)
4. Create database (10 min)
5. Test everything (20 min)

**Total: ~60 minutes** to fully operational

---

**Let's go! 🎉**
