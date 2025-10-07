# Quick Start Guide

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   Create `.env` file:
   ```bash
   PUBLIC_API_URL=http://localhost:8080
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Ensure backend is running**
   ```bash
   # In the backend directory
   go run main.go
   ```

## Quick API Usage Examples

### Authentication

```typescript
import { getCurrentUser, loginWithGitHub, logout } from '@/lib/api';

// Check if logged in
const user = await getCurrentUser();
if (!user) {
  // Redirect to GitHub login
  loginWithGitHub();
}

// Logout
await logout();
```

### Browse Templates

```typescript
import { getTemplates } from '@/lib/api';

// Get all public templates
const templates = await getTemplates({ public: true });

// Get featured templates
const featured = await getTemplates({
  public: true,
  featured: true
});

// Search templates
const results = await getTemplates({
  search: 'web developer',
  tags: ['javascript', 'react'],
  sort: 'downloads',
  limit: 20
});
```

### Template Details & Reviews

```typescript
import {
  getTemplate,
  getTemplateRating,
  getTemplateReviews,
  createReview
} from '@/lib/api';

// Get template
const template = await getTemplate('template-id');

// Get rating
const rating = await getTemplateRating('template-id');
console.log(`${rating.average} stars (${rating.count} reviews)`);

// Get reviews
const reviews = await getTemplateReviews('template-id');

// Leave a review (requires auth)
await createReview({
  template_id: 'template-id',
  rating: 5,
  comment: 'Excellent template!'
});
```

### Favorites

```typescript
import { addFavorite, removeFavorite, getFavorites } from '@/lib/api';

const user = await getCurrentUser();
if (user) {
  // Add to favorites
  await addFavorite(user.id, 'template-id');

  // Get favorites
  const favorites = await getFavorites(user.id);

  // Remove from favorites
  await removeFavorite(user.id, 'template-id');
}
```

### Organizations

```typescript
import {
  getOrganizations,
  createOrganization,
  addOrganizationMember,
  createOrganizationInvite
} from '@/lib/api';

// List organizations
const orgs = await getOrganizations();

// Create organization (requires auth)
const org = await createOrganization({
  name: 'my-org',
  display_name: 'My Organization',
  description: 'A great team',
  public: true
});

// Add member (requires admin)
await addOrganizationMember(org.id, 'user-id', 'member');

// Send invitation (requires admin)
await createOrganizationInvite(org.id, 'user@example.com', 'member');
```

### Create Template

```typescript
import { createTemplate } from '@/lib/api';

const template = await createTemplate({
  name: 'My Template',
  metadata: {
    name: 'My Template',
    description: 'Custom development setup',
    author: 'username',
    version: '1.0.0',
    tags: ['custom', 'development']
  },
  brews: ['git', 'node', 'python'],
  casks: ['visual-studio-code', 'docker'],
  taps: ['homebrew/cask'],
  stow: ['.config'],
  public: true,
  featured: false
});
```

## Using React Components

### Template Reviews

```tsx
import TemplateReviews from '@/components/TemplateReviews';

function TemplateDetailPage({ templateId }) {
  return (
    <div>
      <h1>Template Details</h1>
      <TemplateReviews templateId={templateId} />
    </div>
  );
}
```

### Organization Manager

```tsx
import OrganizationManager from '@/components/OrganizationManager';

function OrganizationsPage() {
  return (
    <div>
      <h1>Manage Organizations</h1>
      <OrganizationManager />
    </div>
  );
}
```

### Templates Browser

```tsx
import TemplatesBrowser from '@/components/TemplatesBrowser';

function TemplatesPage() {
  return (
    <div>
      <h1>Browse Templates</h1>
      <TemplatesBrowser />
    </div>
  );
}
```

## Common Patterns

### Protected Actions

```typescript
const user = await getCurrentUser();
if (!user) {
  toast("Please sign in to continue");
  loginWithGitHub();
  return;
}

// Proceed with authenticated action
await createTemplate({ ... });
```

### Error Handling

```typescript
try {
  const templates = await getTemplates({ public: true });
  setTemplates(templates);
} catch (error) {
  toast("Failed to load templates");
  console.error(error);
}
```

### Loading States

```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getTemplates({ public: true });
      setTemplates(data);
    } catch (error) {
      toast("Error loading templates");
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

if (loading) {
  return <div>Loading...</div>;
}
```

## Environment Variables

### Development
```bash
PUBLIC_API_URL=http://localhost:8080
```

### Production
```bash
PUBLIC_API_URL=https://your-backend.railway.app
```

## Available Endpoints

See `API_INTEGRATION_SUMMARY.md` for complete endpoint documentation.

### Quick Reference

- **Auth**: `/auth/github`, `/auth/logout`, `/auth/user`
- **Templates**: `/api/templates`, `/api/templates/:id`
- **Users**: `/api/users/:id`, `/api/users/username/:username`
- **Organizations**: `/api/organizations`, `/api/organizations/:id/members`
- **Reviews**: `/api/reviews`, `/api/templates/:id/reviews`
- **Favorites**: `/api/users/:id/favorites/:templateId`

## TypeScript Types

All types are exported from `@/lib/api`:

```typescript
import type {
  Template,
  User,
  Organization,
  OrganizationMember,
  Invitation,
  Review,
  Rating,
  TemplateStats
} from '@/lib/api';
```

## Testing

Run the complete example flow:

```typescript
import { exampleCompleteUserFlow } from '@/lib/api-examples';

// Test all functionality
await exampleCompleteUserFlow();
```

---

**Ready to build! All API endpoints are integrated and tested.** 🚀
