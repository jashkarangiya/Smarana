import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smarana.io";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/api/", "/settings/", "/dashboard/", "/problems/", "/admin/"],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
