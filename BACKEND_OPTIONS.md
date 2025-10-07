# Backend OAuth Options

Your backend is returning a 307 redirect, which means it's trying to redirect instead of setting a session and returning JSON. There are two ways to fix this:

## Option 1: Update Backend to Return JSON (Recommended)

Your backend's `/auth/github/callback` endpoint should:

1. Receive the code from frontend
2. Exchange code with GitHub for token
3. Get user info from GitHub
4. Create/update user in DB
5. **Set session cookie**
6. **Return JSON** (not redirect!)

**Example Go code:**

```go
// GET /auth/github/callback
func (h *Handler) HandleGitHubCallback(c *gin.Context) {
    code := c.Query("code")
    state := c.Query("state")

    // Exchange code for token
    token, err := h.exchangeGitHubCode(code)
    if err != nil {
        c.JSON(400, gin.H{"error": "Failed to exchange code"})
        return
    }

    // Get user from GitHub
    githubUser, err := h.getGitHubUser(token)
    if err != nil {
        c.JSON(400, gin.H{"error": "Failed to get user info"})
        return
    }

    // Create/update user in DB
    user, err := h.userService.CreateOrUpdateFromGitHub(githubUser)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to create user"})
        return
    }

    // Create session
    session, err := h.sessionService.Create(user.ID)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to create session"})
        return
    }

    // Set session cookie
    c.SetCookie(
        "session",
        session.Token,
        3600*24*7, // 7 days
        "/",
        "",
        false, // secure (use true in production with HTTPS)
        true,  // httpOnly
    )

    // Return JSON instead of redirecting!
    c.JSON(200, gin.H{
        "success": true,
        "user": user,
    })
}
```

## Option 2: Let Backend Handle Everything (Simpler)

If you don't want to change your backend, we can keep the old flow where backend handles the redirect:

### Change 1: Update GitHub OAuth App

Set callback URL back to backend:
```
http://localhost:8080/auth/github/callback
```

### Change 2: Update Backend Environment

```bash
export OAUTH_REDIRECT_URL="http://localhost:8080/auth/github/callback"
```

### Change 3: Update Frontend Login Function

```typescript
export async function loginWithGitHub(returnTo?: string) {
  // Build return URL as query param for backend
  const returnUrl = returnTo || window.location.pathname;
  const backendUrl = `${API_BASE_URL}/auth/github?return_to=${encodeURIComponent(returnUrl)}`;

  // Redirect directly to backend
  window.location.href = backendUrl;
}
```

### Change 4: Update Backend to Redirect Back to Frontend

After successful OAuth, backend should redirect to:
```
http://localhost:4321/?login=success
```

Or if return_to was provided:
```
http://localhost:4321/templates?login=success
```

## Which Should You Choose?

### Option 1 (JSON Response) - Better for:
- ✅ Modern SPA architecture
- ✅ Better error handling
- ✅ Frontend controls the flow
- ✅ Can show loading states
- ❌ Requires backend code change

### Option 2 (Backend Redirect) - Better for:
- ✅ No backend changes needed
- ✅ Simpler flow
- ✅ Works with existing backend
- ❌ Less control on frontend
- ❌ Can't show custom loading states

## Quick Test for Option 2

Want to test if Option 2 works with your current backend?

1. **Delete the callback page:**
   ```bash
   rm src/pages/auth/github/callback.astro
   ```

2. **Update backend env:**
   ```bash
   export OAUTH_REDIRECT_URL="http://localhost:8080/auth/github/callback"
   ```

3. **Make sure your backend redirects to frontend after success:**
   Your backend's callback handler should end with:
   ```go
   c.Redirect(302, "http://localhost:4321/?login=success")
   ```

4. **Restart backend and try login**

Let me know which option you prefer and I can help implement it!
