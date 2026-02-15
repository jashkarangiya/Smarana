import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smarana.io";

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = [
        "",
        "/about",
        "/team",
        "/contact",
        "/faq",
        "/changelog",
        "/privacy",
        "/terms",
        "/cookies",
        "/extension",
    ];

    const now = new Date();

    return routes.map((route) => ({
        url: `${siteUrl}${route}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.6,
    }));
}
