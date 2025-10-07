# OAuth Quick Fix Guide

## ❌ The Problem

Your backend is saying the OAuth redirect URL should be your frontend? **This is correct!**

## ✅ The Solution

### 1. Update GitHub OAuth App

Go to: https://github.com/settings/developers

**Change callback URL to:**
```
http://localhost:4321/auth/github/callback
```

NOT `http://localhost:8080/...`

### 2. Update Backend Environment Variable

```bash
export OAUTH_REDIRECT_URL="http://localhost:4321/auth/github/callback"
```

### 3. Files Already Created ✅

- ✅ `/auth/github/callback.astro` - Frontend OAuth callback page
- ✅ `api.ts` updated - Login function updated
- ✅ Backend still handles token exchange

## How It Works Now

```
User clicks "Sign in"
    ↓
Frontend → Backend /auth/github
    ↓
Backend → GitHub OAuth
    ↓
GitHub → Frontend /auth/github/callback?code=XXX  ← NEW!
    ↓
Frontend → Backend /auth/github/callback?code=XXX
    ↓
Backend exchanges code, sets cookie
    ↓
Frontend redirects to home (logged in!)
```

## Quick Test

1. **Update GitHub OAuth app callback URL** to `http://localhost:4321/auth/github/callback`

2. **Set backend environment variable:**
   ```bash
   export OAUTH_REDIRECT_URL="http://localhost:4321/auth/github/callback"
   ```

3. **Restart backend:**
   ```bash
   go run main.go
   ```

4. **Visit frontend** and click "Sign in with GitHub"

5. **Should work!** ✅

## What's Different?

| Before | After |
|--------|-------|
| GitHub → Backend callback | GitHub → **Frontend** callback |
| Backend handles everything | Frontend passes code to backend |
| Doesn't work with SPAs | ✅ Works with modern frontends |

## Need More Help?

See the detailed guide: **`OAUTH_SETUP.md`**

---

**TL;DR:** OAuth callback URL should point to your **frontend** (`localhost:4321`), not backend. Frontend receives the code and sends it to backend for exchange. This is the standard OAuth flow for modern web apps! 🎉
