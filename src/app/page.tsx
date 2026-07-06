import { buildWebSiteNameJsonLd, buildLandingJsonLd } from "@/lib/seo";
import { LandingSeoContent } from "@/components/landing/LandingSeoContent";
import { LandingPageClient } from "@/components/landing/LandingPageClient";

export default function LandingPage() {
  return (
    <>
      {/* Dynamic structured data JSON-LD scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildWebSiteNameJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildLandingJsonLd()),
        }}
      />
      
      {/* Crawlable noscript fallback */}
      <LandingSeoContent />
      
      {/* Interactive client page */}
      <LandingPageClient />
    </>
  );
}
export const dynamic = "force-static";
export const revalidate = false;
