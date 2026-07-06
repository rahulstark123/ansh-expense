import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/signup", "/login", "/privacy", "/terms"],
      disallow: [
        "/api/",
        "/adminpanel/",
        "/onboarding/",
        "/dashboard/",
        "/settings/",
        "/activity/",
        "/announcements/",
        "/cashbook/",
        "/company-expenses/",
        "/expenses/",
        "/help/",
        "/reports/",
        "/team/"
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
