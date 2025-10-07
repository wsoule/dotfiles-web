const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:8080";

// ============================================================================
// Type Definitions (matching backend API_TYPES.md)
// ============================================================================

// Share Metadata
export interface ShareMetadata {
  name: string;
  description: string;
  author: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  version: string;
}

// Package Config
export interface PackageConfig {
  post_install?: string[];
  pre_install?: string[];
}

// Global Hooks
export interface Hooks {
  pre_install?: string[];
  post_install?: string[];
  pre_sync?: string[];
  post_sync?: string[];
  pre_stow?: string[];
  post_stow?: string[];
}

// Template Types
export interface Template {
  taps: string[];
  brews: string[];
  casks: string[];
  stow: string[];
  metadata: ShareMetadata;
  extends?: string;
  overrides?: string[];
  addOnly: boolean;
  public: boolean;
  featured: boolean;
  organization_id?: string;
  hooks?: Hooks;
  package_configs?: Record<string, PackageConfig>;
}

export interface StoredTemplate {
  id: string;
  template: Template;
  created_at: string;
  updated_at: string;
  downloads: number;
}

export interface TemplateStats {
  total_templates: number;
  featured_templates: number;
  total_downloads: number;
  categories: number;
}

export interface TemplateRating {
  template_id: string;
  average_rating: number;
  total_ratings: number;
  distribution: Record<string, number>;
}

// User Types
export interface User {
  id: string;
  github_id: number;
  username: string;
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  location: string;
  website: string;
  company: string;
  created_at: string;
  updated_at: string;
  favorites: string[];
  collections: string[];
}

export interface UserProfile {
  user: User;
  reviews: Review[];
  favorite_templates: Template[];
  organizations: Organization[];
  stats: UserStats;
}

export interface UserStats {
  template_count: number;
  review_count: number;
  favorite_count: number;
  organization_count: number;
}

// Review Types
export interface Review {
  id: string;
  template_id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  rating: number;
  comment: string;
  helpful: number;
  created_at: string;
  updated_at: string;
}

// Organization Types
export type OrganizationRole = "owner" | "admin" | "member";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  owner_id: string;
  public: boolean;
  created_at: string;
  updated_at: string;
  member_count: number;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  joined_at: string;
}

export interface OrganizationInvite {
  id: string;
  organization_id: string;
  email: string;
  role: OrganizationRole;
  token: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
}

// API Response Types
export interface ApiError {
  code: string;
  message: string;
  status_code: number;
}

export interface SuccessResponse<T> {
  data: T;
  message?: string;
}

export interface ErrorResponse {
  error: ApiError;
}

export interface PaginatedResponse<T> {
  items: T[];
  limit: number;
  offset: number;
  total: number;
}

// Auth Types
export interface AuthResponse {
  message: string;
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
    avatar_url: string;
  };
}

export interface CurrentUserResponse {
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
    avatar_url: string;
    bio: string;
    location: string;
    website: string;
    created_at: string;
  };
  configured: boolean;
}

// Config Types
export interface BasicConfig {
  brews: string[];
  casks: string[];
  taps: string[];
  stow: string[];
}

export interface ShareableConfig extends BasicConfig {
  metadata: ShareMetadata;
}

export interface StoredConfig {
  id: string;
  config: ShareableConfig;
  public: boolean;
  created_at: string;
  download_count: number;
  owner_id: string;
}

export interface ConfigStats {
  total_configs: number;
  public_configs: number;
  total_downloads: number;
}

// Request Types
export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  description: string;
  website: string;
  public: boolean;
}

export interface CreateTemplateRequest {
  template: Template;
}

// ============================================================================
// Templates API
// ============================================================================

export async function getTemplates(params?: {
  public?: boolean;
  featured?: boolean;
  tags?: string[];
  search?: string;
  sort?: string;
  owner_id?: string;
  organization_id?: string;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.public !== undefined)
    searchParams.set("public", String(params.public));
  if (params?.featured !== undefined)
    searchParams.set("featured", String(params.featured));
  if (params?.tags) searchParams.set("tags", params.tags.join(","));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.owner_id) searchParams.set("owner_id", params.owner_id);
  if (params?.organization_id) searchParams.set("organization_id", params.organization_id);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));

  const response = await fetch(`${API_BASE_URL}/api/templates?${searchParams}`);
  if (!response.ok) throw new Error("Failed to fetch templates");

  const data = await response.json();
  return data.templates as StoredTemplate[];
}

export async function getTemplate(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/templates/${id}`);
  if (!response.ok) throw new Error("Failed to fetch template");
  return response.json() as Promise<StoredTemplate>;
}

export async function downloadTemplate(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/templates/${id}/download`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to download template");
  return response.json();
}

export async function createTemplate(template: Partial<Template>) {
  const response = await fetch(`${API_BASE_URL}/api/templates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(template),
  });
  if (!response.ok) throw new Error("Failed to create template");
  return response.json() as Promise<Template>;
}

export async function updateTemplate(id: string, template: Partial<Template>) {
  const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(template),
  });
  if (!response.ok) throw new Error("Failed to update template");
  return response.json() as Promise<Template>;
}

export async function deleteTemplate(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete template");
  return response.json();
}

export async function searchTemplates(query: string) {
  const searchParams = new URLSearchParams({ search: query });
  const response = await fetch(`${API_BASE_URL}/api/templates/search?${searchParams}`);
  if (!response.ok) throw new Error("Failed to search templates");

  const data = await response.json();
  return data.templates as StoredTemplate[];
}

export async function getTemplateStats() {
  const response = await fetch(`${API_BASE_URL}/api/templates/stats`);
  if (!response.ok) throw new Error("Failed to fetch template stats");
  return response.json() as Promise<TemplateStats>;
}

export async function getTemplateRating(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/templates/${id}/rating`);
  if (!response.ok) throw new Error("Failed to fetch template rating");
  return response.json() as Promise<TemplateRating>;
}

// ============================================================================
// Authentication API
// ============================================================================

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/auth/user`, {
    credentials: "include",
  });
  if (!response.ok) return null;

  const data = await response.json();
  // Backend returns { user: {...}, configured: boolean }
  return data.user as User;
}

export async function loginWithGitHub(returnTo?: string) {
  // Save return URL for after OAuth
  if (returnTo) {
    sessionStorage.setItem('oauth_return_to', returnTo);
  }

  // Redirect to backend OAuth initiation
  // Backend will redirect to GitHub, which will redirect back to our callback page
  window.location.href = `${API_BASE_URL}/auth/github`;
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "GET",
    credentials: "include",
  });
  if (response.ok) {
    window.location.href = "/";
  }
}

// ============================================================================
// Users API
// ============================================================================

export async function getUser(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json() as Promise<User>;
}

export async function getUserByUsername(username: string) {
  const response = await fetch(`${API_BASE_URL}/api/users/username/${username}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json() as Promise<User>;
}

export async function updateUser(id: string, user: Partial<User>) {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error("Failed to update user");
  return response.json() as Promise<User>;
}

export async function deleteUser(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete user");
  return response.json();
}

export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch users");

  const data = await response.json();
  return data.users as User[];
}

// ============================================================================
// Favorites API
// ============================================================================

export async function addFavorite(userId: string, templateId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/users/${userId}/favorites/${templateId}`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  if (!response.ok) throw new Error("Failed to add favorite");
  return response.json();
}

export async function removeFavorite(userId: string, templateId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/users/${userId}/favorites/${templateId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  if (!response.ok) throw new Error("Failed to remove favorite");
  return response.json();
}

export async function getFavorites(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/favorites`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch favorites");

  const data = await response.json();
  return data.templates as StoredTemplate[];
}

// ============================================================================
// Organizations API
// ============================================================================

export async function getOrganizations() {
  const response = await fetch(`${API_BASE_URL}/api/organizations`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch organizations");

  const data = await response.json();
  return data.organizations as Organization[];
}

export async function getOrganization(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${id}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch organization");
  return response.json() as Promise<Organization>;
}

export async function createOrganization(org: Partial<Organization>) {
  const response = await fetch(`${API_BASE_URL}/api/organizations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(org),
  });
  if (!response.ok) throw new Error("Failed to create organization");
  return response.json() as Promise<Organization>;
}

export async function updateOrganization(id: string, org: Partial<Organization>) {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(org),
  });
  if (!response.ok) throw new Error("Failed to update organization");
  return response.json() as Promise<Organization>;
}

export async function deleteOrganization(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete organization");
  return response.json();
}

// ============================================================================
// Organization Members API
// ============================================================================

export async function getOrganizationMembers(orgId: string) {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${orgId}/members`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch organization members");

  const data = await response.json();
  return data.members as OrganizationMember[];
}

export async function addOrganizationMember(
  orgId: string,
  userId: string,
  role: "admin" | "member"
) {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${orgId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ user_id: userId, role }),
  });
  if (!response.ok) throw new Error("Failed to add organization member");
  return response.json();
}

export async function updateOrganizationMemberRole(
  orgId: string,
  userId: string,
  role: "admin" | "member"
) {
  const response = await fetch(
    `${API_BASE_URL}/api/organizations/${orgId}/members/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ role }),
    }
  );
  if (!response.ok) throw new Error("Failed to update member role");
  return response.json();
}

export async function removeOrganizationMember(orgId: string, userId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/organizations/${orgId}/members/${userId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );
  if (!response.ok) throw new Error("Failed to remove organization member");
  return response.json();
}

// ============================================================================
// Organization Invitations API
// ============================================================================

export async function getOrganizationInvites(orgId: string) {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${orgId}/invites`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch organization invites");

  const data = await response.json();
  return data.invites as Invitation[];
}

export async function createOrganizationInvite(
  orgId: string,
  email: string,
  role: "admin" | "member"
) {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${orgId}/invites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, role }),
  });
  if (!response.ok) throw new Error("Failed to create organization invite");
  return response.json() as Promise<Invitation>;
}

export async function acceptOrganizationInvite(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/organizations/invites/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ token }),
  });
  if (!response.ok) throw new Error("Failed to accept organization invite");
  return response.json();
}

// ============================================================================
// Reviews & Ratings API
// ============================================================================

export async function createReview(review: {
  template_id: string;
  rating: number;
  comment?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/templates/${review.template_id}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ rating: review.rating, comment: review.comment }),
  });
  if (!response.ok) throw new Error("Failed to create review");
  return response.json() as Promise<Review>;
}

export async function getReview(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch review");
  return response.json() as Promise<Review>;
}

export async function updateReview(
  id: string,
  review: { rating?: number; comment?: string }
) {
  const response = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(review),
  });
  if (!response.ok) throw new Error("Failed to update review");
  return response.json() as Promise<Review>;
}

export async function deleteReview(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete review");
  return response.json();
}

export async function getTemplateReviews(templateId: string) {
  const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}/reviews`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch template reviews");

  const data = await response.json();
  return data.reviews as Review[];
}

export async function getUserReviews(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/reviews`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch user reviews");

  const data = await response.json();
  return data.reviews as Review[];
}

export async function markReviewHelpful(reviewId: string) {
  const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/helpful`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to mark review helpful");
  return response.json();
}
