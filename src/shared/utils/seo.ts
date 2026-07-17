import { seoDefaults } from "../constants";

type SeoInput = {
  title?: string;
  description?: string;
  path?: string;
};

const setMeta = (name: string, content: string, property = false) => {
  const attr = property ? "property" : "name";
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.content = content;
};

export const applySeo = ({
  title = seoDefaults.title,
  description = seoDefaults.description,
  path = "/"
}: SeoInput) => {
  const canonicalHref = `${seoDefaults.url}${path}`;
  document.title = title;
  setMeta("description", description);
  setMeta("og:title", title, true);
  setMeta("og:description", description, true);
  setMeta("og:type", "website", true);
  setMeta("og:url", canonicalHref, true);
  setMeta("og:image", seoDefaults.image, true);
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalHref;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "UPRISE",
    url: seoDefaults.url,
    logo: `${seoDefaults.url}/uprise-logo.svg`,
    sameAs: ["https://www.linkedin.com/company/uprise", "https://www.instagram.com/uprise"],
    description
  };

  let script = document.head.querySelector<HTMLScriptElement>('script[data-schema="organization"]');
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.schema = "organization";
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(structuredData);
};
