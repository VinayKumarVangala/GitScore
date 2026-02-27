/**
 * GitScore Monitoring Hub
 * Handles error logging and performance metrics.
 */

export interface ErrorReport {
    message: string;
    stack?: string;
    timestamp: string;
    context?: Record<string, any>;
    severity: "low" | "medium" | "high" | "critical";
}

export function logError(error: Error | string, context?: Record<string, any>, severity: ErrorReport["severity"] = "medium") {
    const report: ErrorReport = {
        message: typeof error === "string" ? error : error.message,
        stack: typeof error === "string" ? undefined : error.stack,
        timestamp: new Date().toISOString(),
        context,
        severity,
    };

    // Console output with mystical formatting
    const colors = {
        low: "color: #00ffff",        // Cyan
        medium: "color: #9333ea",     // Purple
        high: "color: #f97316",       // Orange
        critical: "color: #ef4444",   // Red
    };

    console.error(
        `%c[Scrying Error] [${severity.toUpperCase()}] %c${report.message}`,
        colors[severity],
        "color: inherit",
        { context, stack: report.stack }
    );

    // Placeholder for Sentry/LogRocket integration
    if (process.env.NODE_ENV === "production") {
        // if (Sentry) Sentry.captureException(error, { extra: context, level: severity });
    }
}

export function measurePerformance<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
        return fn();
    } finally {
        const end = performance.now();
        const duration = end - start;

        if (duration > 100) { // Log slow operations (>100ms)
            console.warn(`[Spectral Lag] ${name} took ${duration.toFixed(2)}ms`);
        }
    }
}

export async function measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
        return await fn();
    } finally {
        const end = performance.now();
        const duration = end - start;

        if (duration > 500) { // Log slow async operations (>500ms)
            console.warn(`[Rift Delay] ${name} took ${duration.toFixed(2)}ms`);
        }
    }
}
