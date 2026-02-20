# Deployment Checklist for SynCareer

## Pre-Deployment (Local Development)

- [ ] Clone the repository: `git clone https://github.com/stevemensah333-rgb/syncareer.git`
- [ ] Install dependencies: `pnpm install`
- [ ] Copy `.env.example` to `.env` and fill in required keys
- [ ] Run locally: `pnpm dev`
- [ ] Test all features work locally
- [ ] Push changes to GitHub

## Supabase Setup

### Database
- [ ] Log in to Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Run the SQL from `supabase/init.sql` to create tables
- [ ] Verify all tables created successfully
- [ ] Check Row Level Security (RLS) policies are applied

### Authentication
- [ ] Enable Email auth provider
- [ ] Configure SMTP settings for emails
- [ ] Test signup and login flow
- [ ] Verify user can reset password

### API Keys & Configuration
- [ ] Copy `Project URL` and `Anon Key` 
- [ ] Verify they match in `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`

## External API Integration

### 1. ElevenLabs (Voice TTS)
- [ ] Create account at https://elevenlabs.io
- [ ] Generate API key
- [ ] Verify subscription covers API usage
- [ ] Note your API key for Vercel setup

### 2. Resend (Email Service)
- [ ] Create account at https://resend.com
- [ ] Add your domain or use default
- [ ] Generate API key
- [ ] Add sender email domain
- [ ] Note your API key for Vercel setup

### 3. AI Services (Vercel AI Gateway)
- [ ] No setup needed - uses default Vercel AI Gateway
- [ ] Verify OpenAI models available in your region

## Vercel Deployment

### Connect Repository
- [ ] Go to https://vercel.com
- [ ] Click "New Project"
- [ ] Select GitHub repo: `stevemensah333-rgb/syncareer`
- [ ] Select branch: `main`
- [ ] Vercel auto-detects Vite config

### Environment Variables
- [ ] In Vercel Dashboard → Settings → Environment Variables
- [ ] Add the following variables for **Production**:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
ELEVENLABS_API_KEY=your_elevenlabs_key
RESEND_API_KEY=your_resend_key
```

- [ ] All variables added for Production environment
- [ ] All variables added for Preview environment (same values)

### Deploy
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (3-5 minutes)
- [ ] Verify no build errors

## Post-Deployment Testing

### Core Functionality
- [ ] Visit deployed URL
- [ ] Test landing page loads
- [ ] Test signup/login works
- [ ] Test password reset flow
- [ ] Create test user account

### Student Features
- [ ] Access Assessment page
- [ ] Access AI Coach (test message sends)
- [ ] Access Interview Simulator (test voice if available)
- [ ] Access CV Builder
- [ ] Upload portfolio project

### Employer Features
- [ ] Create employer account
- [ ] Create company profile
- [ ] Post a job
- [ ] Test Hire with AI (send message)

### Admin Features
- [ ] Access Feedback Dashboard
- [ ] Verify data displays correctly

### Integrations
- [ ] Test email sending (send invitation)
- [ ] Test voice TTS (interview simulator)
- [ ] Test AI responses (AI Coach, Hire with AI)

## Performance & Security

- [ ] Check Vercel Analytics
- [ ] Verify response times < 500ms
- [ ] Check for 4xx/5xx errors
- [ ] Run Lighthouse audit (target: 90+)
- [ ] Test on mobile devices
- [ ] Verify HTTPS enabled
- [ ] Check CORS headers correct
- [ ] Verify RLS policies working (try unauthorized access)

## Monitoring

### Vercel Dashboard
- [ ] Set up error tracking
- [ ] Set up performance monitoring
- [ ] Configure deployment notifications

### Supabase Dashboard
- [ ] Monitor Database usage
- [ ] Monitor Auth user growth
- [ ] Check API stats
- [ ] Monitor storage usage

### External Services
- [ ] Monitor ElevenLabs usage
- [ ] Monitor Resend sending limits
- [ ] Check Vercel AI Gateway usage

## Production Maintenance

### Daily
- [ ] Check Vercel build status
- [ ] Monitor error logs
- [ ] Verify email delivery

### Weekly
- [ ] Check database performance
- [ ] Review user feedback
- [ ] Monitor API costs

### Monthly
- [ ] Review and optimize queries
- [ ] Update dependencies
- [ ] Rotate API keys (if needed)
- [ ] Review security logs

## Rollback Procedure

If deployment fails:

1. Check error logs in Vercel Dashboard
2. Verify all environment variables are set
3. Check if Supabase is accessible
4. Rollback to previous deployment:
   - Vercel Dashboard → Deployments
   - Find last successful deployment
   - Click → Promote to Production
5. If issues persist, check GitHub Actions logs

## Emergency Contacts

- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- ElevenLabs Support: https://elevenlabs.io/support
- Resend Support: https://resend.com/support

## Success Criteria

Your deployment is successful when:

✅ Build completes without errors
✅ All pages load without 404 errors
✅ Auth (signup/login/reset) works
✅ Database queries complete < 500ms
✅ All API integrations respond correctly
✅ Email sends successfully
✅ Voice TTS generates audio
✅ AI responses appear in < 3 seconds
✅ Mobile UI is responsive
✅ No console errors in browser DevTools
