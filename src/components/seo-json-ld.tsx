import { getBaseUrl } from "@/lib/baseUrl";

export function SeoJsonLd() {
    const appUrl = getBaseUrl();

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Smarana",
            url: appUrl,
            description:
                "Smarana helps you retain algorithm patterns using spaced repetition. Track solved problems, review on schedule, and build long-term recall.",
        },
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Smarana",
            url: appUrl,
            logo: `${appUrl}/logo.png`,
        },
        {
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Jash Karangiya",
            url: appUrl,
            worksFor: {
                "@type": "Organization",
                name: "Smarana",
                url: appUrl,
            },
            sameAs: ["https://github.com/jashkarangiya"],
        },
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Smarana",
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web",
            url: appUrl,
            description:
                "A spaced repetition layer for algorithms: retain patterns, schedule reviews, and stay consistent.",
        },
    ];

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
