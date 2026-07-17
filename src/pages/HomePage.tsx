import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { InsightsSection } from "../features/blog";
import { ContactSection } from "../features/contact";
import { HeroSection, WhoSection, FounderSection, MetricsSection } from "../features/home";
import { PortfolioSection } from "../features/portfolio";
import { ServicesSection } from "../features/services";
import {
  staticServices,
  staticTimeline,
  staticHighlights,
  metrics,
  staticClients,
  staticCaseStudies,
  staticTestimonials,
  staticInsights
} from "../shared/constants";
import { fetchPublicContent, submitContact } from "../shared/services";
import type { ApiService, ApiCaseStudy, ApiTestimonial, ApiBlog } from "../shared/services";
import { applySeo } from "../shared/utils";

export default function HomePage() {
  const mutation = useMutation({ mutationFn: submitContact });

  // Fetch live content; fall back to static data while loading or on error
  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ["public-content"],
    queryFn: fetchPublicContent,
    staleTime: 1000 * 60 * 5, // 5 min
    retry: 1
  });

  // Merge: prefer API data, fall back to static
  const services: {
    title: string;
    slug: string;
    summary?: string;
    description?: string;
    deliverables: string[];
    benefits: string[];
    icon?: React.ElementType;
    story?: string;
    relatedCase?: string;
    successStories?: string[];
  }[] = content?.services?.length
    ? content.services.map((s: ApiService) => ({ ...s, summary: s.description }))
    : staticServices;

  const caseStudiesData: Partial<ApiCaseStudy>[] = content?.caseStudies?.length
    ? content.caseStudies
    : staticCaseStudies.map((cs) => ({
        title: cs.title,
        category: cs.category,
        clientName: cs.client,
        results: cs.metrics
      }));

  const testimonialData: Partial<ApiTestimonial>[] = content?.testimonials?.length
    ? content.testimonials
    : staticTestimonials;

  const insightsData: Partial<ApiBlog>[] = content?.blogs?.length
    ? content.blogs
    : staticInsights.map((i) => ({ title: i.title, excerpt: i.excerpt, readTime: i.readTime }));

  const clientNames: string[] = content?.clients?.length ? content.clients.map((c) => c.name) : staticClients;

  const founderTimeline = content?.founder?.timeline?.length ? content.founder.timeline : staticTimeline;
  const founderHighlights = content?.founder?.highlights?.length
    ? content.founder.highlights.map((h) => `${h.value} ${h.label}`)
    : staticHighlights;

  useEffect(() => {
    applySeo({});
  }, []);

  return (
    <main id="main-content">
      <HeroSection />
      <WhoSection />
      <FounderSection
        content={content}
        contentLoading={contentLoading}
        founderTimeline={founderTimeline}
        founderHighlights={founderHighlights}
      />
      <MetricsSection metrics={metrics} />
      <ServicesSection services={services} contentLoading={contentLoading} />
      <PortfolioSection
        clientNames={clientNames}
        caseStudiesData={caseStudiesData}
        testimonialData={testimonialData}
        contentLoading={contentLoading}
      />
      <InsightsSection insightsData={insightsData} contentLoading={contentLoading} />
      <ContactSection services={services} mutation={mutation} />
    </main>
  );
}
