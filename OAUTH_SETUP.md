# GitHub OAuth Setup Guide

## The OAuth Flow

Here's how the OAuth flow works with frontend + backend:

```
1. User clicks "Sign in with GitHub" on frontend (localhost:4321)
   ↓
2. Frontend redirects to backend /auth/github (localhost:8080)
   ↓
3. Backend redirects to GitHub OAuth
   ↓
4. User authorizes on GitHub
   ↓
5. GitHub redirects back to frontend callback (localhost:4321/auth/github/callback?code=XXX)
   ↓
6. Frontend callback page sends code to backend
   ↓
7. Backend exchanges code for access token, creates session
   ↓
8. Frontend redirects user to home/original page with session cookie
```

## 1. GitHub OAuth App Configuration

Go to: https://github.com/settings/developers

### Development Settings

Create a new OAuth App with these settings:

```
Application name: Dotfiles Manager (Dev)
Homepage URL: http://localhost:4321
Authorization callback URL: http://localhost:4321/auth/github/callback
```

**Important:** The callback URL must point to your **frontend**, not backend!

Copy the **Client ID** and **Client Secret**.

### Production Settings (when deploying)

```
Application name: Dotfiles Manager
Homepage URL: https://your-frontend-domain.com
Authorization callback URL: https://your-frontend-domain.com/auth/github/callback
```

## 2. Backend Configuration

### Environment Variables

Update your backend `.env` or environment:

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
OAUTH_REDIRECT_URL=http://localhost:4321/auth/github/callback

# Server
PORT=8080

# Database (optional)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=dotfiles
```

### Important Backend Code Check

Your backend's `/auth/github` endpoint should:

1. Build GitHub OAuth URL with redirect_uri pointing to frontend callback
2. Redirect user to GitHub

Your backend's `/auth/github/callback` endpoint should:

1. Receive the authorization code from frontend
2. Exchange code for access token with GitHub
3. Get user info from GitHub
4. Create/update user in database
5. Set session cookie
6. Return success response

**Example backend flow (pseudo-code):**

```go
// GET /auth/github
func (h *Handler) InitiateGitHubOAuth(c *gin.Context) {
    state := generateRandomState()
    // Store state in session for validation

    redirectURL := fmt.Sprintf(
        "https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&state=%s&scope=user:email",
        h.config.GitHubClientID,
        h.config.OAuthRedirectURL, // This should be frontend callback URL
        state,
    )

    c.Redirect(http.StatusTemporaryRedirect, redirectURL)
}

// GET /auth/github/callback
func (h *Handler) HandleGitHubCallback(c *gin.Context) {
    code := c.Query("code")
    state := c.Query("state")

    // Validate state
    // Exchange code for token
    token := exchangeCodeForToken(code)

    // Get user info from GitHub
    githubUser := getUserFromGitHub(token)

    // Create/update user in database
    user := createOrUpdateUser(githubUser)

    // Create session
    session := createSession(user.ID)

    // Set session cookie
    c.SetCookie("session", session.Token, 3600*24*7, "/", "", false, true)

    // Return success (frontend will handle redirect)
    c.JSON(200, gin.H{"success": true, "user": user})
}
```

## 3. Frontend Configuration

### Environment Variables

Create/update `.env` in your frontend:

```bash
PUBLIC_API_URL=http://localhost:8080
```

### Files Created

✅ **`/auth/github/callback.astro`** - Handles OAuth callback from GitHub
✅ **`api.ts`** updated - loginWithGitHub function updated

## 4. Testing the OAuth Flow

### Step-by-step test:

1. **Start backend:**
   ```bash
   cd /path/to/backend
   export GITHUB_CLIENT_ID="your_client_id"
   export GITHUB_CLIENT_SECRET="your_client_secret"
   export OAUTH_REDIRECT_URL="http://localhost:4321/auth/github/callback"
   go run main.go
   ```

2. **Start frontend:**
   ```bash
   cd /path/to/frontend
   npm run dev
   ```

3. **Test login:**
   - Visit http://localhost:4321
   - Click "Sign in with GitHub"
   - You should be redirected to: `http://localhost:8080/auth/github`
   - Backend redirects you to: `https://github.com/login/oauth/authorize?...`
   - Authorize the app on GitHub
   - GitHub redirects you to: `http://localhost:4321/auth/github/callback?code=XXX`
   - Frontend callback page sends code to backend
   - You should see "Success! Redirecting..."
   - You should be redirected back to homepage, now logged in

## 5. Common Issues & Solutions

### Issue: "redirect_uri_mismatch" from GitHub

**Solution:**
- Check that GitHub OAuth app callback URL matches exactly: `http://localhost:4321/auth/github/callback`
- Check backend `OAUTH_REDIRECT_URL` matches exactly
- No trailing slashes!

### Issue: CORS error when calling backend from callback page

**Solution:** Backend needs CORS middleware allowing `http://localhost:4321`:

```go
router.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:4321"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
    AllowCredentials: true,
}))
```

### Issue: Cookie not being set

**Solution:**
- Backend must set cookie with proper domain/path
- Frontend must use `credentials: 'include'` in fetch calls (already done ✅)
- Check that cookie SameSite settings allow cross-origin (if on different ports)

### Issue: User redirected to callback page but nothing happens

**Solution:**
- Check browser console for errors
- Check that backend `/auth/github/callback` endpoint exists
- Check that code is being passed correctly in URL query params

## 6. Production Deployment

### Update GitHub OAuth App

Create a new OAuth app (or update existing) with production URLs:

```
Homepage URL: https://your-frontend.com
Callback URL: https://your-frontend.com/auth/github/callback
```

### Update Backend Environment

```bash
GITHUB_CLIENT_ID=production_client_id
GITHUB_CLIENT_SECRET=production_client_secret
OAUTH_REDIRECT_URL=https://your-frontend.com/auth/github/callback
```

### Update Frontend Environment

```bash
PUBLIC_API_URL=https://your-backend.com
```

### CORS Configuration

Update backend CORS to allow production frontend domain:

```go
AllowOrigins: []string{
    "http://localhost:4321",           // Dev
    "https://your-frontend.com",       // Production
}
```

## 7. Session Cookie Configuration

Your backend should set cookies like this:

```go
// Development
c.SetCookie(
    "session",           // name
    sessionToken,        // value
    3600 * 24 * 7,      // maxAge (7 days)
    "/",                // path
    "",                 // domain (empty for same-origin)
    false,              // secure (false for http)
    true,               // httpOnly
)

// Production (HTTPS)
c.SetCookie(
    "session",
    sessionToken,
    3600 * 24 * 7,
    "/",
    "your-frontend.com", // domain
    true,                // secure (true for https)
    true,                // httpOnly
)
```

## 8. Verification Checklist

- [ ] GitHub OAuth app created with correct callback URL
- [ ] Backend has correct environment variables
- [ ] Backend CORS allows frontend domain
- [ ] Backend sets session cookies correctly
- [ ] Frontend has correct API_URL
- [ ] Frontend callback page exists at `/auth/github/callback`
- [ ] Can click "Sign in" and complete OAuth flow
- [ ] Session cookie is set after successful login
- [ ] Subsequent API calls include session cookie
- [ ] Can access protected endpoints after login

---

**The key difference from backend-only OAuth:**

- **Callback URL** points to frontend (not backend)
- **Frontend** receives the code from GitHub
- **Frontend** sends code to backend for exchange
- **Backend** still handles token exchange and session creation
- **Frontend** handles final redirect to user's destination

This is the standard OAuth flow for SPAs (Single Page Applications) and Astro/React frontends! 🎉
