import {
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck,
  Megaphone,
  Presentation,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Service = {
  title: string;
  slug: string;
  summary: string;
  deliverables: string[];
  benefits: string[];
  story: string;
  relatedCase: string;
  icon: LucideIcon;
};

export type CaseStudy = {
  title: string;
  category: string;
  client: string;
  result: string;
  narrative: string;
  metrics: string[];
  image: string;
};

export const navItems = [
  { label: "Home", href: "#home" },
  { label: "Work", href: "#work" },
  { label: "Founder", href: "#founder" },
  { label: "Insights", href: "#insights" },
  { label: "Contact", href: "#contact" }
];

export const metrics = [
  { value: "180+", label: "Premium campaigns and brand moments" },
  { value: "42", label: "Industries advised across India and GCC markets" },
  { value: "9.4x", label: "Average earned-media amplification on flagship launches" },
  { value: "96%", label: "Retainer renewal rate across advisory mandates" }
];

export const services: Service[] = [
  {
    title: "Brand Advisory",
    slug: "brand-advisory",
    summary: "Executive brand positioning, market narrative, reputation architecture, and leadership communication.",
    deliverables: ["Brand audit", "Positioning system", "Founder narrative", "Reputation playbook"],
    benefits: ["Sharper category authority", "Improved executive trust", "Clearer investor and partner communication"],
    story:
      "Repositioned a regional premium business into an expansion-ready advisory brand with a concise market story.",
    relatedCase: "Executive Repositioning Sprint",
    icon: BriefcaseBusiness
  },
  {
    title: "Event Media",
    slug: "event-media",
    summary: "High-impact event coverage, press orchestration, creator media, and post-event content engines.",
    deliverables: ["Event media plan", "Press room", "Creator briefs", "Post-event content suite"],
    benefits: ["Stronger launch recall", "Faster content turnaround", "Higher-quality proof of impact"],
    story: "Converted a luxury launch into a multi-format content campaign that outlived the event by six weeks.",
    relatedCase: "Luxury Launch Media Desk",
    icon: CalendarCheck
  },
  {
    title: "Promotions",
    slug: "promotions",
    summary: "Premium campaign promotion across social, creator, partner, offline, and earned channels.",
    deliverables: ["Promotion calendar", "Channel mix", "Influencer shortlist", "Performance report"],
    benefits: ["More qualified attention", "Efficient media spend", "Tighter channel accountability"],
    story: "Scaled a public awareness campaign through partnership-led promotion and controlled narrative sequencing.",
    relatedCase: "Regional Awareness Mandate",
    icon: Megaphone
  },
  {
    title: "Campaign Strategy",
    slug: "campaign-strategy",
    summary:
      "Concept, sequencing, content architecture, measurement, and launch-room governance for pivotal campaigns.",
    deliverables: ["Campaign thesis", "Content map", "Launch calendar", "Measurement dashboard"],
    benefits: ["Clearer execution rhythm", "Reduced campaign waste", "Stronger leadership visibility"],
    story: "Built a multi-city campaign strategy that aligned brand, media, and field activation teams.",
    relatedCase: "Market Entry Campaign",
    icon: Target
  },
  {
    title: "Strategic Consulting",
    slug: "strategic-consulting",
    summary: "Founder-level advisory for growth, category creation, stakeholder confidence, and market entry.",
    deliverables: ["Strategic review", "Growth thesis", "Partner map", "Decision memo"],
    benefits: ["Better strategic choices", "Premium partner readiness", "More credible market expansion"],
    story:
      "Guided a founder team through a high-stakes repositioning before partnership and fundraising conversations.",
    relatedCase: "Founder Advisory Retainer",
    icon: Presentation
  }
];

export const founderTimeline = [
  {
    year: "2014",
    title: "Media Foundations",
    detail: "Built the operating discipline for high-pressure event and promotion environments."
  },
  {
    year: "2017",
    title: "Brand Advisory Expansion",
    detail: "Moved from execution-led work into positioning, campaign governance, and growth advisory."
  },
  {
    year: "2020",
    title: "Strategic Partnerships",
    detail: "Developed cross-sector relationships with enterprises, institutions, venues, and premium consumer brands."
  },
  {
    year: "2024",
    title: "UPRISE Platform Era",
    detail: "Integrated event media, brand strategy, promotion, and founder-led consulting into one premium practice."
  }
];

export const founderHighlights = [
  "Founder-first counsel for ambitious businesses entering visible markets.",
  "Operational fluency across media rooms, event floors, boardrooms, and creator ecosystems.",
  "Leadership philosophy grounded in clarity, credibility, restraint, and measurable impact.",
  "Industries served: luxury, hospitality, education, real estate, public initiatives, entertainment, SaaS, and retail."
];

export const caseStudies: CaseStudy[] = [
  {
    title: "Executive Repositioning Sprint",
    category: "Brand Advisory",
    client: "Premium services group",
    result: "3-month narrative reset before investor meetings",
    narrative:
      "UPRISE rebuilt the brand story, founder profile, market proof, and stakeholder presentation system for a leadership team moving upmarket.",
    metrics: ["42% increase in qualified inbound", "12 investor-ready assets", "6 leadership media features"],
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Luxury Launch Media Desk",
    category: "Event Media",
    client: "Hospitality brand",
    result: "Launch content engine with earned reach",
    narrative:
      "A single flagship event became a coordinated media system across press, creators, executive content, and partner amplification.",
    metrics: ["9.8x reach lift", "36-hour hero film delivery", "28 partner placements"],
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Market Entry Campaign",
    category: "Campaign Strategy",
    client: "Consumer expansion team",
    result: "Multi-city activation model",
    narrative:
      "UPRISE designed the market narrative, launch sequence, influencer mix, and reporting framework for a category entry mandate.",
    metrics: ["5 city launch playbook", "64% lower wasted spend", "18 strategic partners"],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
  }
];

export const clients = [
  "Aurum Hospitality",
  "Northstar Ventures",
  "Prism Events",
  "CivicReach",
  "Monarch Retail",
  "Vantage Studios",
  "Elevate Education",
  "Axis Venues"
];

export const testimonials = [
  {
    quote: "UPRISE gave our leadership team a level of narrative clarity we had been missing for years.",
    name: "Managing Director",
    company: "Premium Services Group"
  },
  {
    quote:
      "The event did not end at the venue. Their media strategy kept the launch alive across every stakeholder channel.",
    name: "Brand Head",
    company: "Hospitality Portfolio"
  }
];

export const insights = [
  {
    title: "Why premium brands need narrative governance before promotion",
    category: "Brand Strategy",
    readTime: "6 min",
    excerpt: "Visibility without narrative discipline creates noise. Premium brands need a sharper operating rhythm."
  },
  {
    title: "The founder profile as a strategic asset",
    category: "Founder Advisory",
    readTime: "5 min",
    excerpt: "In high-trust categories, the founder is not a mascot. The founder is a credibility system."
  },
  {
    title: "Turning events into content infrastructure",
    category: "Event Media",
    readTime: "7 min",
    excerpt: "The most valuable event output is often the proof, story, and media library that follows."
  }
];

export const dashboardStats = [
  { label: "New leads", value: "27", icon: UsersRound },
  { label: "Active campaigns", value: "14", icon: Sparkles },
  { label: "SEO score", value: "100", icon: BarChart3 },
  { label: "Security posture", value: "A", icon: ShieldCheck }
];

export const adminModules = [
  "Dashboard",
  "Founder Management",
  "Services Management",
  "Portfolio Management",
  "Case Studies",
  "Blog Management",
  "Testimonials",
  "Clients",
  "Media Library",
  "Lead Management",
  "SEO Management",
  "Settings"
];

export const leadPipeline = [
  { status: "New", count: 8 },
  { status: "Contacted", count: 6 },
  { status: "Discussion", count: 5 },
  { status: "Proposal Sent", count: 4 },
  { status: "Converted", count: 3 },
  { status: "Closed", count: 1 }
];

export const policyContent = {
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: June 9, 2026",
    sections: [
      "UPRISE collects contact, inquiry, analytics, and communication data only to deliver advisory, media, promotion, and consulting services.",
      "Client and lead information is stored securely, access-controlled, and used for legitimate business communication.",
      "Users may request correction, export, or deletion of personal data by contacting the UPRISE team."
    ]
  },
  cookies: {
    title: "Cookie Policy",
    updated: "Last updated: June 9, 2026",
    sections: [
      "Essential cookies keep the site secure and remember consent choices.",
      "Analytics cookies help UPRISE understand content performance and improve user journeys.",
      "Marketing cookies support campaign measurement and retargeting only when consent is granted."
    ]
  },
  terms: {
    title: "Terms & Conditions",
    updated: "Last updated: June 9, 2026",
    sections: [
      "Website content is provided for informational purposes and does not create a client engagement unless agreed in writing.",
      "UPRISE intellectual property, strategy materials, media assets, and advisory frameworks may not be reproduced without permission.",
      "Service proposals, timelines, pricing, and deliverables are governed by written statements of work."
    ]
  }
};

export const seoDefaults = {
  title: "UPRISE | Premium Brand Advisory, Event Media & Strategic Consulting",
  description:
    "UPRISE elevates ambitious brands through founder-led strategy, premium event media, campaign promotion, and strategic consulting.",
  url: "https://uprise.example.com",
  image: "/uprise-logo.svg"
};
