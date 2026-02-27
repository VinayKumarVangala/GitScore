"use client";

/**
 * GitScore Mystical Analytics
 * A lightweight wrapper for event tracking and performance monitoring.
 */

export type EventCategory = "search" | "share" | "export" | "watchlist" | "navigation";

interface AnalyticsEvent {
    action: string;
    category: EventCategory;
    label?: string;
    value?: number;
    metadata?: Record<string, any>;
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Track page views
export const trackPageView = (url: string) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("config", GA_TRACKING_ID, {
            page_path: url,
        });
    }
};

// Track custom events
export const trackEvent = ({ action, category, label, value, metadata }: AnalyticsEvent) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", action, {
            event_category: category,
            event_label: label,
            value: value,
            ...metadata,
        });
    }

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
        console.log(`[Mystical Analytics] ${category.toUpperCase()}: ${action}`, { label, value, metadata });
    }
};

// Track web vitals
export const trackVital = ({ name, delta, id }: { name: string; delta: number; id: string }) => {
    trackEvent({
        action: name,
        category: "navigation",
        label: id,
        value: Math.round(name === "CLS" ? delta * 1000 : delta),
        metadata: { non_interaction: true },
    });
};
