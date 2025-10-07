# Backend Database Error Fix

## The Error

```
"Failed to check existing user"
```

This means your backend is trying to access a database but failing.

## Solution 1: Use In-Memory Storage (Quick Fix)

Your backend supports in-memory storage. **Don't set MongoDB environment variables:**

```bash
# Make sure these are NOT set:
unset MONGODB_URI
unset MONGODB_DATABASE

# Only set these:
export GITHUB_CLIENT_ID="your_client_id"
export GITHUB_CLIENT_SECRET="your_client_secret"
export OAUTH_REDIRECT_URL="http://localhost:4321/auth/github/callback"
export PORT=8080

# Restart backend
go run main.go
```

The backend should log something like:
```
Using in-memory storage
```

## Solution 2: Fix MongoDB Connection

If you want to use MongoDB:

### Start MongoDB locally:

```bash
# macOS
brew services start mongodb-community

# Or with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Set environment variables:

```bash
export MONGODB_URI="mongodb://localhost:27017"
export MONGODB_DATABASE="dotfiles"
export GITHUB_CLIENT_ID="your_client_id"
export GITHUB_CLIENT_SECRET="your_client_secret"
export OAUTH_REDIRECT_URL="http://localhost:4321/auth/github/callback"
export PORT=8080

# Restart backend
go run main.go
```

## Solution 3: Check Backend Code

The error is happening in your user repository. Check this file in your backend:

**`internal/repository/user_repository.go`** or similar

Look for a function like `CheckExistingUser` or `FindByGitHubID` and make sure:

1. It handles the case when MongoDB is not connected
2. It falls back to in-memory storage
3. It doesn't panic on database errors

**Example fix:**

```go
func (r *UserRepository) FindByGitHubID(githubID int) (*models.User, error) {
    // If using in-memory storage
    if r.db == nil {
        for _, user := range r.memoryStore {
            if user.GitHubID == githubID {
                return user, nil
            }
        }
        return nil, nil // Not found is OK
    }

    // MongoDB code here...
}
```

## Quick Test

After fixing, test the OAuth flow:

1. Restart your backend
2. Go to http://localhost:4321
3. Click "Sign in with GitHub"
4. Should work now! ✅

## What's Happening

```
User clicks login
    ↓
Frontend → Backend /auth/github (✅ works - 307 redirect)
    ↓
GitHub OAuth (✅ works - user authorizes)
    ↓
Frontend callback receives code (✅ works)
    ↓
Frontend → Backend /auth/github/callback?code=XXX
    ↓
Backend tries to check if user exists (❌ FAILS HERE)
    ↓
Error: "Failed to check existing user"
```

The backend is trying to query the database but it's not connected or not initialized properly.

## Most Likely Fix

**Remove MongoDB environment variables and use in-memory storage:**

```bash
# .env or your terminal
PORT=8080
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
OAUTH_REDIRECT_URL=http://localhost:4321/auth/github/callback

# DO NOT SET:
# MONGODB_URI=...
# MONGODB_DATABASE=...
```

Then restart:
```bash
go run main.go
```

Look for a log message like:
- ✅ "Using in-memory storage" or "No MongoDB configured, using memory storage"
- ❌ "Connected to MongoDB" (if you see this but MongoDB isn't running, that's the problem)

Try this and let me know if it works!
