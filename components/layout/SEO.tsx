"use client";

import Head from "next/head";
import { useRouter } from "next/router";

interface SEOProps {
    title?: string;
    description?: string;
    ogImage?: string;
    ogType?: "website" | "profile" | "article";
    canonical?: string;
    username?: string;
}

const DEFAULT_TITLE = "GitScore | Mystical GitHub Engineering Scryer";
const DEFAULT_DESC = "Transmute your GitHub contributions into coordinates. Deep analysis of your technical depth, social impact, and consistency.";
const DEFAULT_OG_IMAGE = "https://git-score-v1.vercel.app/api/og?score=90&grade=S";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://git-score-v1.vercel.app";

export default function SEO({
    title,
    description,
    ogImage,
    ogType = "website",
    canonical,
    username,
}: SEOProps) {
    const router = useRouter();
    const fullTitle = title ? `${title} | GitScore` : DEFAULT_TITLE;
    const metaDesc = description || DEFAULT_DESC;
    const url = `${SITE_URL}${router.asPath}`;
    const canonicalURL = canonical || url;
    const finalOgImage = ogImage || DEFAULT_OG_IMAGE;

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDesc} />
            <link rel="canonical" href={canonicalURL} />

            {/* Open Graph */}
            <meta property="og:site_name" content="GitScore" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDesc} />
            <meta property="og:url" content={url} />
            <meta property="og:type" content={ogType} />
            <meta property="og:image" content={finalOgImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@gitscore" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDesc} />
            <meta name="twitter:image" content={finalOgImage} />

            {/* Profile specific meta (for profile pages) */}
            {ogType === "profile" && username && (
                <meta property="profile:username" content={username} />
            )}

            {/* Icons & Theme */}
            <link rel="icon" href="/favicon.ico" />
            <meta name="theme-color" content="#00ffff" />
        </Head>
    );
}
