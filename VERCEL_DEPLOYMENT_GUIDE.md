# 🚀 Vercel Deployment Guide - GitHub Authentication Fix

## Problem
GitHub sign-in buttons not working on Vercel deployment.

## Root Cause
Missing environment variables and OAuth configuration issues.

## 🔧 Step-by-Step Fix

### 1. Configure Environment Variables in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your LuminaWeb project
3. Navigate to **Settings → Environment Variables**
4. Add the following variables:

```bash
# Required for Authentication
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# API Keys (if using these features)
VITE_SCRAPINGBEE_API_KEY=your_scrapingbee_key
VITE_GROQ_API_KEY=your_groq_key

# Configuration
VITE_API_TIMEOUT=30000
VITE_ENABLE_DEBUG=false
```

**To get your Supabase credentials:**
- Go to [Supabase Dashboard](https://app.supabase.com)
- Select your project → Settings → API
- Copy the **Project URL** and **anon/public key**

### 2. Configure Supabase Authentication URLs

1. In your Supabase project, go to **Authentication → URL Configuration**
2. Add your Vercel URLs to **Redirect URLs**:

```
https://your-app-name.vercel.app/
https://your-app-name.vercel.app/**
```

3. Update **Site URL** to your production domain:
```
https://your-app-name.vercel.app
```

### 3. Configure GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Select your OAuth App (or create one if missing)
3. Update **Authorization callback URL**:
```
https://your-supabase-project.supabase.co/auth/v1/callback
```

### 4. Configure Supabase GitHub Provider

1. In Supabase → **Authentication → Providers**
2. Enable **GitHub** provider
3. Add your GitHub OAuth app credentials:
   - **Client ID**: From your GitHub OAuth app
   - **Client Secret**: From your GitHub OAuth app

### 5. Deploy and Test

1. After setting environment variables, trigger a new deployment:
```bash
# If using Vercel CLI
vercel --prod

# Or push to your main branch to trigger auto-deployment
git push origin main
```

2. Test the GitHub sign-in on your Vercel URL

## 🔍 Debugging Steps

### Check Environment Variables
1. Add this temporary debug component to verify env vars are loaded:

```typescript
// Add to any page temporarily
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### Check Network Tab
1. Open browser DevTools → Network tab
2. Try GitHub sign-in
3. Look for failed requests to Supabase
4. Check if redirect URLs are correct

### Check Supabase Logs
1. Go to Supabase → **Logs**
2. Look for authentication errors
3. Check for OAuth provider issues

## 🚨 Common Issues

### Issue 1: "Invalid redirect URL"
**Fix:** Ensure your Vercel domain is added to Supabase redirect URLs

### Issue 2: "Missing environment variables"
**Fix:** Verify environment variables are set in Vercel and redeploy

### Issue 3: "GitHub OAuth app not found"
**Fix:** Ensure GitHub OAuth app is configured with correct callback URL

### Issue 4: "Provider not enabled"
**Fix:** Enable GitHub provider in Supabase authentication settings

## ✅ Verification Checklist

- [ ] Environment variables set in Vercel
- [ ] Supabase redirect URLs configured
- [ ] GitHub OAuth app callback URL set
- [ ] GitHub provider enabled in Supabase
- [ ] New deployment triggered
- [ ] GitHub sign-in tested on production URL

## 🔗 Useful Links

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps) 