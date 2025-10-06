const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:8080";

export interface Template {
  id: string;
    taps: string[];
    brews: string[];
    casks: string[];
    stow: string[];
    metadata: {
      name: string;
      description: string;
      author: string;
      version: string;
      tags: string[];
    };
    public: boolean;
    featured: boolean;
    organization_id?: string;
  downloads: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar_url: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  created_at: string;
}

// Templates API
export async function getTemplates(params?: {
  public?: boolean;
  featured?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.public !== undefined)
    searchParams.set("public", String(params.public));
  if (params?.featured !== undefined)
    searchParams.set("featured", String(params.featured));
  if (params?.tags) searchParams.set("tags", params.tags.join(","));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));

  const response = await fetch(`${API_BASE_URL}/api/templates?${searchParams}`);
  if (!response.ok) throw new Error("Failed to fetch templates");

  const data = await response.json();
  return data.templates as Template[];
}

export async function getTemplate(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/templates/${id}`);
  if (!response.ok) throw new Error("Failed to fetch template");
  return response.json() as Promise<Template>;
}

export async function downloadTemplate(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/templates/${id}/download`);
  if (!response.ok) throw new Error("Failed to download template");
  return response.json();
}

export async function createTemplate(
  template: Partial<Template>,
  token?: string,
) {
  const response = await fetch(`${API_BASE_URL}/api/templates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
    body: JSON.stringify(template),
  });
  if (!response.ok) throw new Error("Failed to create template");
  return response.json();
}

// Auth API
export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/auth/user`, {
    credentials: "include",
  });
  if (!response.ok) return null;
  return response.json() as Promise<User>;
}

export async function loginWithGitHub() {
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

// Favorites API
export async function addFavorite(templateId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/users/favorites/${templateId}`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  if (!response.ok) throw new Error("Failed to add favorite");
  return response.json();
}

export async function removeFavorite(templateId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/users/favorites/${templateId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  if (!response.ok) throw new Error("Failed to remove favorite");
  return response.json();
}

export async function getFavorites() {
  const response = await fetch(`${API_BASE_URL}/api/users/favorites`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch favorites");
  return response.json();
}
