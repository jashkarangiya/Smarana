import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/baseUrl";

export default function robots(): MetadataRoute.Robots {
    const appUrl = getBaseUrl();

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/api/", "/settings/", "/dashboard/", "/problems/", "/admin/"],
        },
        sitemap: `${appUrl}/sitemap.xml`,
    };
}
