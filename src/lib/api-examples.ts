/**
 * API Usage Examples
 *
 * This file demonstrates how to use all the API endpoints
 * integrated from the Go backend with GitHub OAuth authentication.
 */

import {
  // Auth
  getCurrentUser,
  loginWithGitHub,
  logout,

  // Templates
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  downloadTemplate,
  searchTemplates,
  getTemplateStats,
  getTemplateRating,

  // Users
  getUser,
  getUserByUsername,
  updateUser,
  deleteUser,
  getUsers,

  // Favorites
  addFavorite,
  removeFavorite,
  getFavorites,

  // Organizations
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,

  // Organization Members
  getOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMemberRole,
  removeOrganizationMember,

  // Organization Invitations
  getOrganizationInvites,
  createOrganizationInvite,
  acceptOrganizationInvite,

  // Reviews & Ratings
  createReview,
  getReview,
  updateReview,
  deleteReview,
  getTemplateReviews,
  getUserReviews,
  markReviewHelpful,
} from './api';

// ============================================================================
// Authentication Examples
// ============================================================================

export async function exampleAuth() {
  // Check if user is logged in
  const user = await getCurrentUser();
  if (!user) {
    // Redirect to GitHub OAuth login
    loginWithGitHub();
    return;
  }

  console.log('Current user:', user);

  // Logout
  // await logout();
}

// ============================================================================
// Templates Examples
// ============================================================================

export async function exampleTemplates() {
  // Get all public templates
  const allTemplates = await getTemplates({ public: true, limit: 100 });

  // Get featured templates only
  const featuredTemplates = await getTemplates({
    public: true,
    featured: true
  });

  // Search templates with filters
  const searchResults = await getTemplates({
    search: "web developer",
    tags: ["javascript", "react"],
    sort: "downloads",
    public: true,
    limit: 20,
    offset: 0
  });

  // Get a specific template
  const template = await getTemplate("template-id");

  // Download template
  const templateData = await downloadTemplate("template-id");

  // Create new template (requires auth)
  const newTemplate = await createTemplate({
    name: "My Custom Template",
    metadata: {
      name: "My Custom Template",
      description: "A custom dotfiles template",
      author: "username",
      version: "1.0.0",
      tags: ["custom", "development"]
    },
    brews: ["git", "node"],
    casks: ["visual-studio-code"],
    taps: ["homebrew/cask"],
    stow: [],
    public: true,
    featured: false
  });

  // Update template (requires auth)
  const updated = await updateTemplate("template-id", {
    metadata: {
      name: "Updated Template Name",
      description: "Updated description",
      author: "username",
      version: "1.1.0",
      tags: ["updated"]
    }
  });

  // Delete template (requires auth)
  // await deleteTemplate("template-id");

  // Search templates
  const searched = await searchTemplates("nodejs");

  // Get platform statistics
  const stats = await getTemplateStats();
  console.log('Platform stats:', stats);

  // Get template rating
  const rating = await getTemplateRating("template-id");
  console.log('Rating:', rating.average, 'Stars:', rating.count);
}

// ============================================================================
// Users Examples
// ============================================================================

export async function exampleUsers() {
  // Get user by ID
  const user = await getUser("user-id");

  // Get user by username
  const userByName = await getUserByUsername("octocat");

  // Update current user profile (requires auth)
  const updated = await updateUser("user-id", {
    bio: "Full stack developer",
    location: "San Francisco",
    website: "https://example.com"
  });

  // Get all users (admin only?)
  const allUsers = await getUsers();

  // Delete user (requires auth)
  // await deleteUser("user-id");
}

// ============================================================================
// Favorites Examples
// ============================================================================

export async function exampleFavorites() {
  const user = await getCurrentUser();
  if (!user) return;

  // Add template to favorites
  await addFavorite(user.id, "template-id");

  // Remove from favorites
  await removeFavorite(user.id, "template-id");

  // Get user's favorites
  const favorites = await getFavorites(user.id);
  console.log('User favorites:', favorites);
}

// ============================================================================
// Organizations Examples
// ============================================================================

export async function exampleOrganizations() {
  // Get all organizations
  const orgs = await getOrganizations();

  // Get specific organization
  const org = await getOrganization("org-id");

  // Create organization (requires auth)
  const newOrg = await createOrganization({
    name: "my-org",
    display_name: "My Organization",
    description: "A great organization",
    public: true
  });

  // Update organization (requires owner/admin)
  const updated = await updateOrganization("org-id", {
    display_name: "Updated Org Name",
    description: "Updated description"
  });

  // Delete organization (requires owner)
  // await deleteOrganization("org-id");

  // Get organization members
  const members = await getOrganizationMembers("org-id");

  // Add member (requires owner/admin)
  await addOrganizationMember("org-id", "user-id", "member");

  // Update member role (requires owner/admin)
  await updateOrganizationMemberRole("org-id", "user-id", "admin");

  // Remove member (requires owner/admin)
  await removeOrganizationMember("org-id", "user-id");

  // Get pending invitations
  const invites = await getOrganizationInvites("org-id");

  // Create invitation (requires owner/admin)
  const invite = await createOrganizationInvite(
    "org-id",
    "user@example.com",
    "member"
  );

  // Accept invitation
  await acceptOrganizationInvite("invitation-token");
}

// ============================================================================
// Reviews & Ratings Examples
// ============================================================================

export async function exampleReviews() {
  // Create a review (requires auth)
  const review = await createReview({
    template_id: "template-id",
    rating: 5,
    comment: "Excellent template! Very useful."
  });

  // Get specific review
  const fetchedReview = await getReview("review-id");

  // Update review (requires auth, must be owner)
  const updated = await updateReview("review-id", {
    rating: 4,
    comment: "Updated review comment"
  });

  // Delete review (requires auth, must be owner)
  // await deleteReview("review-id");

  // Get all reviews for a template
  const templateReviews = await getTemplateReviews("template-id");
  console.log('Template reviews:', templateReviews);

  // Get all reviews by a user
  const userReviews = await getUserReviews("user-id");
  console.log('User reviews:', userReviews);

  // Mark review as helpful
  await markReviewHelpful("review-id");
}

// ============================================================================
// Complete User Flow Example
// ============================================================================

export async function exampleCompleteUserFlow() {
  // 1. Check authentication
  const user = await getCurrentUser();
  if (!user) {
    loginWithGitHub();
    return;
  }

  // 2. Browse templates
  const templates = await getTemplates({
    public: true,
    featured: true,
    limit: 10
  });

  // 3. View template details with rating
  const template = templates[0];
  const rating = await getTemplateRating(template.id);
  const reviews = await getTemplateReviews(template.id);

  console.log(`Template: ${template.metadata.name}`);
  console.log(`Rating: ${rating.average} (${rating.count} reviews)`);

  // 4. Add to favorites
  await addFavorite(user.id, template.id);

  // 5. Download template
  const templateData = await downloadTemplate(template.id);

  // 6. Leave a review
  await createReview({
    template_id: template.id,
    rating: 5,
    comment: "Great template!"
  });

  // 7. Get user's favorites
  const favorites = await getFavorites(user.id);
  console.log('My favorites:', favorites);

  // 8. Create own template
  const myTemplate = await createTemplate({
    name: "My Custom Setup",
    metadata: {
      name: "My Custom Setup",
      description: "My personal development environment",
      author: user.username,
      version: "1.0.0",
      tags: ["personal", "development"]
    },
    brews: ["git", "node", "python"],
    casks: ["visual-studio-code", "docker"],
    taps: ["homebrew/cask"],
    stow: [".config"],
    public: true,
    featured: false
  });

  console.log('Created template:', myTemplate);
}
