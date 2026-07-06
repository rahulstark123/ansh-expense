import { Metadata } from "next";
import {
  SITE_URL,
  SITE_NAME,
  COMPANY_NAME,
  COMPANY_URL,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  SEO_KEYWORDS,
  GOOGLE_SITE_VERIFICATION,
} from "./site";
import { LANDING_FAQS, WHAT_EXPENSE_DOES } from "./landing-seo";

interface BuildMetadataParams {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

export function buildSiteMetadata(params: BuildMetadataParams = {}): Metadata {
  const { title, description, path = "", noIndex = false } = params;
  const canonicalUrl = `${SITE_URL}${path}`;

  const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: title
      ? {
          absolute: title,
        }
      : {
          default: DEFAULT_TITLE,
          template: `%s | ${SITE_NAME}`,
        },
    description: description || DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    publisher: SITE_NAME,
    creator: COMPANY_NAME,
    keywords: SEO_KEYWORDS,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: title || DEFAULT_TITLE,
      description: description || DEFAULT_DESCRIPTION,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title || DEFAULT_TITLE,
      description: description || DEFAULT_DESCRIPTION,
    },
    verification: {
      google: GOOGLE_SITE_VERIFICATION,
    },
    icons: {
      icon: "/anshFavicon.png",
    },
  };


  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
      },
    };
  }

  return metadata;
}

/**
 * A. Standalone WebSite schema (most important for Google site name)
 * Rendered in a separate script block on the homepage
 */
export function buildWebSiteNameJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "name": SITE_NAME,
    "alternateName": [`${SITE_NAME} App`],
    "url": `${SITE_URL}/`,
    "publisher": {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
    },
  };
}

/**
 * B. Organization, WebPage, SoftwareApplication, and FAQPage schema
 * Consolidated inside a single graph representation
 */
export function buildLandingJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/logoAnshapps.png`,
        },
        "parentOrganization": {
          "@type": "Organization",
          "name": COMPANY_NAME,
          "url": COMPANY_URL,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        "url": `${SITE_URL}/`,
        "name": SITE_NAME,
        "headline": DEFAULT_TITLE,
        "description": DEFAULT_DESCRIPTION,
        "isPartOf": {
          "@id": `${SITE_URL}/#website`,
        },
        "publisher": {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#application`,
        "name": SITE_NAME,
        "operatingSystem": "All",
        "applicationCategory": "BusinessApplication",
        "url": SITE_URL,
        "description": WHAT_EXPENSE_DOES,
        "publisher": {
          "@id": `${SITE_URL}/#organization`,
        },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "INR",
          "lowPrice": "0",
          "highPrice": "499",
          "offerCount": "2",
          "offers": [
            {
              "@type": "Offer",
              "name": "Free Tier",
              "price": "0",
              "priceCurrency": "INR",
            },
            {
              "@type": "Offer",
              "name": "Pro Tier",
              "price": "499",
              "priceCurrency": "INR",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "referenceQuantity": {
                  "@type": "QuantitativeValue",
                  "value": "1",
                  "unitCode": "ANN",
                },
              },
            },
          ],
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faqpage`,
        "mainEntity": LANDING_FAQS.map((faq) => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a,
          },
        })),
      },
    ],
  };
}
