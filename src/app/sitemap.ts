import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/baseUrl";

export default function sitemap(): MetadataRoute.Sitemap {
    const appUrl = getBaseUrl();

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
        url: `${appUrl}${route}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.6,
    }));
}
