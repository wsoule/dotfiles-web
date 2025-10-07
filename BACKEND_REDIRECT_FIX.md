# Backend Redirect Issue

## The Problem

After successful authentication, you're being redirected to:
```
http://localhost:4321/auth/github/[object%20Object]
```

This means your **backend** is trying to redirect and passing an object instead of a URL string.

## The Solution

Your backend's `/auth/github/callback` endpoint should **NOT redirect**. It should return JSON.

### Update Your Backend Callback Handler

**Find this in your backend code** (probably `internal/handlers/auth.go` or similar):

**WRONG ❌ (Current code probably looks like this):**
```go
func (h *Handler) HandleGitHubCallback(c *gin.Context) {
    // ... exchange code for token
    // ... get user info
    // ... create session
    // ... set cookie

    // DON'T DO THIS:
    c.Redirect(302, "http://localhost:4321")  // ❌ Wrong!
}
```

**CORRECT ✅ (Should be this):**
```go
func (h *Handler) HandleGitHubCallback(c *gin.Context) {
    code := c.Query("code")
    state := c.Query("state")

    // Exchange code for token
    token, err := h.exchangeGitHubCode(code)
    if err != nil {
        c.JSON(400, gin.H{"error": map[string]interface{}{
            "code": "AUTH_ERROR",
            "message": "Failed to exchange code",
        }})
        return
    }

    // Get user from GitHub
    githubUser, err := h.getGitHubUser(token)
    if err != nil {
        c.JSON(400, gin.H{"error": map[string]interface{}{
            "code": "AUTH_ERROR",
            "message": "Failed to get user info",
        }})
        return
    }

    // Create/update user in DB
    user, err := h.userService.CreateOrUpdateFromGitHub(githubUser)
    if err != nil {
        c.JSON(500, gin.H{"error": map[string]interface{}{
            "code": "INTERNAL_ERROR",
            "message": "Failed to create user",
        }})
        return
    }

    // Create session
    session, err := h.sessionService.Create(user.ID)
    if err != nil {
        c.JSON(500, gin.H{"error": map[string]interface{}{
            "code": "INTERNAL_ERROR",
            "message": "Failed to create session",
        }})
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

    // Return JSON - NOT a redirect! ✅
    c.JSON(200, gin.H{
        "success": true,
        "user": user,
    })
}
```

## Key Points

1. **No `c.Redirect()`** in the callback handler
2. **Return JSON** with `c.JSON(200, ...)`
3. **Set the session cookie** before returning
4. **Frontend handles the redirect** (it already does this)

## Why This Happens

The `[object Object]` error suggests your backend is doing something like:

```go
// This creates [object Object] in the URL:
c.Redirect(302, someObject)  // ❌ Wrong!

// Or maybe:
returnUrl := c.Query("return_to")  // This might be empty/undefined
c.Redirect(302, returnUrl)  // ❌ Redirects to empty/undefined
```

## After You Fix

1. Update your backend callback handler to return JSON (not redirect)
2. Restart your backend
3. Try logging in again
4. Should work! ✅

The flow will be:
```
Frontend callback page
    ↓
Calls backend /auth/github/callback
    ↓
Backend returns JSON: {"success": true, "user": {...}}
    ↓
Frontend receives JSON ✅
    ↓
Frontend redirects to home page
    ↓
User is logged in! 🎉
```

## Quick Test

After fixing, check your browser's Network tab:

1. Look for the request to `http://localhost:8080/auth/github/callback`
2. Click on it
3. Check the **Response** tab
4. Should see JSON like: `{"success": true, "user": {...}}`
5. Should **NOT** see a redirect (302/307)

Let me know if you need help finding the exact file in your backend!
