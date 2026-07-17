import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "Full platform access",
      permissions: ["*"]
    }
  });

  await prisma.role.upsert({
    where: { name: "EDITOR" },
    update: {},
    create: {
      name: "EDITOR",
      description: "Content and lead management access",
      permissions: ["content:write", "leads:write", "media:write", "seo:write"]
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@uprise.example" },
    update: {},
    create: {
      name: "UPRISE Administrator",
      email: "admin@uprise.example",
      passwordHash: await bcrypt.hash("ChangeMe123!", 12),
      roleId: adminRole.id
    }
  });

  const founder = await prisma.founderProfile.create({
    data: {
      name: "Ravi Ganeshan",
      title: "Founder, Brand Advisor & Strategic Media Architect",
      biography:
        "Founder-led advisory profile for premium brand, event media, promotion, and strategic consulting mandates.",
      leadershipPhilosophy: "Clarity first, credibility always, execution with restraint, measurement without vanity.",
      industriesServed: ["Luxury", "Hospitality", "Education", "Real Estate", "Public Initiatives", "SaaS", "Retail"],
      strategicExpertise: [
        "Brand positioning",
        "Founder narrative",
        "Campaign strategy",
        "Event media",
        "Partner ecosystems"
      ],
      achievements: ["180+ premium campaigns", "42 industries advised", "96% retainer renewal rate"],
      companiesWorkedWith: ["Aurum Hospitality", "Northstar Ventures", "Prism Events", "CivicReach"],
      clientImpact:
        "Improved leadership visibility, higher-quality inbound conversations, and stronger stakeholder trust.",
      professionalSummary:
        "A strategic operator fluent in brand rooms, event floors, media desks, and executive decision-making.",
      timeline: {
        create: [
          {
            year: "2014",
            title: "Media Foundations",
            detail: "Built the operating discipline for event and promotion environments.",
            sortOrder: 1
          },
          {
            year: "2017",
            title: "Brand Advisory Expansion",
            detail: "Moved into positioning, campaign governance, and growth advisory.",
            sortOrder: 2
          },
          {
            year: "2020",
            title: "Strategic Partnerships",
            detail: "Built cross-sector relationships with institutions, venues, and premium brands.",
            sortOrder: 3
          },
          {
            year: "2024",
            title: "UPRISE Platform Era",
            detail: "Integrated media, strategy, promotion, and consulting into one premium practice.",
            sortOrder: 4
          }
        ]
      },
      highlights: {
        create: [
          { label: "Campaigns", value: "180+", sortOrder: 1 },
          { label: "Industries", value: "42", sortOrder: 2 },
          { label: "Renewal rate", value: "96%", sortOrder: 3 }
        ]
      }
    }
  });

  const services = [
    ["Brand Advisory", "brand-advisory"],
    ["Event Media", "event-media"],
    ["Promotions", "promotions"],
    ["Campaign Strategy", "campaign-strategy"],
    ["Strategic Consulting", "strategic-consulting"]
  ];

  for (const [index, [title, slug]] of services.entries()) {
    await prisma.service.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        slug,
        description: `${title} for premium brands that need strategic clarity, execution discipline, and measurable impact.`,
        deliverables: ["Discovery", "Strategy system", "Execution plan", "Performance reporting"],
        benefits: ["Authority", "Trust", "Efficient execution"],
        successStories: ["Seeded from UPRISE platform launch"],
        isPublished: true,
        sortOrder: index + 1
      }
    });
  }

  const category = await prisma.blogCategory.upsert({
    where: { slug: "brand-strategy" },
    update: {},
    create: {
      name: "Brand Strategy",
      slug: "brand-strategy",
      description: "Founder-led authority content for premium brand growth."
    }
  });

  await prisma.blog.create({
    data: {
      title: "Why premium brands need narrative governance before promotion",
      slug: "premium-brands-narrative-governance",
      excerpt: "Visibility without narrative discipline creates noise.",
      content: "Premium brands need a sharper operating rhythm before scaling visibility.",
      readTime: "6 min",
      authorName: founder.name,
      categoryId: category.id,
      isFeatured: true,
      isPublished: true,
      publishedAt: new Date()
    }
  });

  await prisma.seoSetting.upsert({
    where: { route: "/" },
    update: {},
    create: {
      route: "/",
      title: "UPRISE | Premium Brand Advisory, Event Media & Strategic Consulting",
      description: "Founder-led strategy, premium event media, campaign promotion, and strategic consulting.",
      structuredData: { "@type": "Organization", name: "UPRISE" }
    }
  });

  await prisma.siteSetting.upsert({
    where: { key: "brand" },
    update: {},
    create: {
      key: "brand",
      group: "identity",
      value: {
        name: "UPRISE",
        colors: ["#0A0A0A", "#121212", "#D4AF37", "#F4D03F", "#FFFFFF", "#B8B8B8"]
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
