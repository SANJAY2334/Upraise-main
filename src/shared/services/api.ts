import { authFetch, getApiUrl } from "./auth";

export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  interest: string;
  message: string;
  consent: boolean;
};

async function getCsrfToken() {
  const res = await fetch(getApiUrl("/api/csrf"), { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load CSRF token.");
  const json = (await res.json()) as { success: boolean; data: { csrfToken: string } };
  return json.data.csrfToken;
}

export async function submitContact(payload: ContactPayload) {
  const csrfToken = await getCsrfToken();

  const response = await fetch(getApiUrl("/api/contact"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Unable to submit inquiry." }));
    throw new Error(body.message ?? "Unable to submit inquiry.");
  }

  return response.json() as Promise<{ id: string; status: string }>;
}

// ─── Public Content ──────────────────────────────────────────────────────────
export async function fetchPublicContent() {
  const res = await fetch(getApiUrl("/api/content/public"));
  if (!res.ok) throw new Error("Failed to load content.");
  const json = (await res.json()) as {
    success: boolean;
    data: {
      services: ApiService[];
      caseStudies: ApiCaseStudy[];
      blogs: ApiBlog[];
      clients: ApiClient[];
      testimonials: ApiTestimonial[];
      founder: ApiFounder | null;
    };
  };
  return json.data;
}

// ─── Admin helpers ───────────────────────────────────────────────────────────
async function adminGet<T>(path: string): Promise<T> {
  const res = await authFetch(path);
  if (!res.ok) {
    const b = await res.json().catch(() => ({ message: "Request failed." }));
    throw new Error(b.message ?? "Request failed.");
  }
  const json = (await res.json()) as { success: boolean; data: T };
  return json.data;
}

async function adminPost<T>(path: string, body: unknown): Promise<T> {
  const csrfToken = await getCsrfToken();
  const res = await authFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({ message: "Request failed." }));
    throw new Error(b.message ?? "Request failed.");
  }
  const json = (await res.json()) as { success: boolean; data: T };
  return json.data;
}

async function adminPatch<T>(path: string, body: unknown): Promise<T> {
  const csrfToken = await getCsrfToken();
  const res = await authFetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({ message: "Request failed." }));
    throw new Error(b.message ?? "Request failed.");
  }
  const json = (await res.json()) as { success: boolean; data: T };
  return json.data;
}

async function adminDelete(path: string): Promise<void> {
  const csrfToken = await getCsrfToken();
  const res = await authFetch(path, {
    method: "DELETE",
    headers: { "x-csrf-token": csrfToken }
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({ message: "Request failed." }));
    throw new Error(b.message ?? "Request failed.");
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────
export type PaginatedResponse<T> = { data: T[]; total: number; page: number; limit: number };

export type ApiService = {
  id: string;
  title: string;
  slug: string;
  description: string;
  deliverables: string[];
  benefits: string[];
  successStories: string[];
  isPublished: boolean;
  sortOrder: number;
};

export type ApiProject = {
  id: string;
  title: string;
  slug: string;
  category: string;
  clientName: string;
  story: string;
  results: string[];
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
};

export type ApiMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  interest: string;
  message: string;
  consent: boolean;
  createdAt: string;
  lead?: { status: string } | null;
};

export type ApiMediaAsset = {
  id: string;
  publicId: string;
  url: string;
  resourceType: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  alt?: string;
  createdAt: string;
};

export type ApiCaseStudy = {
  id: string;
  title: string;
  slug: string;
  category: string;
  clientName: string;
  challenge: string;
  strategy: string;
  execution: string;
  results: string[];
  metrics: Record<string, string>;
  isFeatured: boolean;
  isPublished: boolean;
};

export type ApiBlog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  readTime: string;
  authorName: string;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt?: string;
  category?: { name: string; slug: string };
  tags?: { name: string; slug: string }[];
};

export type ApiClient = {
  id: string;
  name: string;
  industry: string;
  website?: string;
  isPublished: boolean;
};

export type ApiTestimonial = {
  id: string;
  quote: string;
  name: string;
  title?: string;
  company?: string;
  rating: number;
  isPublished: boolean;
};

export type ApiFounder = {
  id: string;
  name: string;
  title: string;
  biography: string;
  leadershipPhilosophy: string;
  industriesServed: string[];
  strategicExpertise: string[];
  achievements: string[];
  clientImpact: string;
  professionalSummary: string;
  portraitMedia?: ApiMediaAsset | null;
  timeline: { year: string; title: string; detail: string }[];
  highlights: { label: string; value: string }[];
};

export type DashboardStats = {
  leads: number;
  projects: number;
  blogs: number;
  mediaAssets: number;
  services: number;
  messages: number;
};

// ─── Admin API Functions ─────────────────────────────────────────────────────
export const api = {
  dashboard: () => adminGet<DashboardStats>("/api/admin/dashboard"),

  leads: (params?: { page?: number; status?: string | undefined }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.status) q.set("status", params.status);
    return adminGet<PaginatedResponse<{ id: string; name: string; email: string; status: string; createdAt: string }>>(
      `/api/admin/leads?${q}`
    );
  },
  updateLeadStatus: (id: string, status: string) =>
    adminPatch<{ id: string; status: string }>(`/api/admin/leads/${id}/status`, { status }),

  messages: (params?: { page?: number; search?: string | undefined }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    return adminGet<PaginatedResponse<ApiMessage>>(`/api/admin/messages?${q}`);
  },
  deleteMessage: (id: string) => adminDelete(`/api/admin/messages/${id}`),

  services: (params?: { page?: number; search?: string | undefined }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    return adminGet<PaginatedResponse<ApiService>>(`/api/admin/services?${q}`);
  },
  createService: (data: Omit<ApiService, "id">) => adminPost<ApiService>("/api/admin/services", data),
  updateService: (id: string, data: Partial<Omit<ApiService, "id">>) =>
    adminPatch<ApiService>(`/api/admin/services/${id}`, data),
  deleteService: (id: string) => adminDelete(`/api/admin/services/${id}`),

  projects: (params?: { page?: number; search?: string | undefined }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    return adminGet<PaginatedResponse<ApiProject>>(`/api/admin/projects?${q}`);
  },
  createProject: (data: Omit<ApiProject, "id" | "createdAt">) => adminPost<ApiProject>("/api/admin/projects", data),
  updateProject: (id: string, data: Partial<Omit<ApiProject, "id" | "createdAt">>) =>
    adminPatch<ApiProject>(`/api/admin/projects/${id}`, data),
  deleteProject: (id: string) => adminDelete(`/api/admin/projects/${id}`),

  media: (params?: { page?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    return adminGet<PaginatedResponse<ApiMediaAsset>>(`/api/admin/media?${q}`);
  },
  uploadMedia: async (file: File, alt?: string): Promise<ApiMediaAsset> => {
    const csrfToken = await getCsrfToken();
    const fd = new FormData();
    fd.append("asset", file);
    if (alt) fd.append("alt", alt);
    const res = await authFetch("/api/media", {
      method: "POST",
      headers: { "x-csrf-token": csrfToken },
      body: fd
    });
    if (!res.ok) {
      const b = await res.json().catch(() => ({ message: "Upload failed." }));
      throw new Error(b.message ?? "Upload failed.");
    }
    return res.json() as Promise<ApiMediaAsset>;
  },
  deleteMedia: (id: string) => adminDelete(`/api/admin/media/${id}`)
};
