export interface AuthUserDTO {
  id: string;
  email: string;
  role: string;
  status: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDTO;
}

export interface RefreshResponseDTO {
  accessToken: string;
}

export interface MeResponseDTO {
  user: AuthUserDTO;
}

export interface ServiceDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  deliverables: string[];
  benefits: string[];
  successStories: string[];
  isPublished: boolean;
  sortOrder: number;
}

export interface CaseStudyDTO {
  id: string;
  title: string;
  slug: string;
  category: string;
  clientName: string;
  challenge: string;
  strategy: string;
  execution: string;
  results: string[];
  metrics: Record<string, string> | null;
  isFeatured: boolean;
  isPublished: boolean;
}

export interface BlogCategoryDTO {
  name: string;
  slug: string;
}

export interface BlogTagDTO {
  name: string;
  slug: string;
}

export interface BlogDTO {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  readTime: string;
  authorName: string;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  category?: BlogCategoryDTO;
  tags?: BlogTagDTO[];
}

export interface ClientDTO {
  id: string;
  name: string;
  industry: string;
  website: string | null;
  isPublished: boolean;
}

export interface TestimonialDTO {
  id: string;
  quote: string;
  name: string;
  title: string | null;
  company: string | null;
  rating: number;
  isPublished: boolean;
}

export interface FounderTimelineDTO {
  year: string;
  title: string;
  detail: string;
}

export interface FounderHighlightDTO {
  label: string;
  value: string;
}

export interface FounderProfileDTO {
  id: string;
  name: string;
  title: string;
  biography: string;
  leadershipPhilosophy: string;
  industriesServed: string[];
  strategicExpertise: string[];
  achievements: string[];
  professionalSummary: string;
  clientImpact: string;
  portraitMedia?: MediaAssetDTO | null;
  timeline: FounderTimelineDTO[];
  highlights: FounderHighlightDTO[];
}

export interface PublicContentResponseDTO {
  services: ServiceDTO[];
  caseStudies: CaseStudyDTO[];
  blogs: BlogDTO[];
  clients: ClientDTO[];
  testimonials: TestimonialDTO[];
  founder: FounderProfileDTO | null;
}

export interface ContactMessageDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  interest: string;
  message: string;
  consent: boolean;
  createdAt: string;
  lead?: { status: string } | null;
}

export interface ContactResponseDTO {
  id: string;
  status: string;
}

export interface MediaAssetDTO {
  id: string;
  publicId: string;
  url: string;
  resourceType: string;
  format?: string | null;
  bytes?: number | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  createdAt: string;
}

export interface DashboardResponseDTO {
  leads: number;
  projects: number;
  blogs: number;
  mediaAssets: number;
  services: number;
  messages: number;
}

export interface LeadDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  source: string;
  interest: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDTO {
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
  updatedAt: string;
}

export interface PaginatedResponseDTO<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
