/**
 * Simple alerting system with support for multiple channels.
 */

export interface AlertPayload {
    title: string;
    message: string;
    severity: "INFO" | "WARNING" | "CRITICAL";
    source: string;
    metadata?: Record<string, any>;
}

export async function triggerAlert(payload: AlertPayload) {
    console.log(`[AlertSystem] [${payload.severity}] ${payload.title}: ${payload.message}`);

    // Logic for different channels (Slack/Discord/Email)
    const promises = [];

    if (process.env.SLACK_WEBHOOK_URL) {
        promises.push(sendSlackAlert(payload));
    }

    if (process.env.DISCORD_WEBHOOK_URL) {
        promises.push(sendDiscordAlert(payload));
    }

    // Daily usage reports and other logic could be added here

    await Promise.allSettled(promises);
}

async function sendSlackAlert(payload: AlertPayload) {
    try {
        const color = payload.severity === "CRITICAL" ? "#FF0000" : payload.severity === "WARNING" ? "#FFA500" : "#00FFFF";
        await fetch(process.env.SLACK_WEBHOOK_URL!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                attachments: [{
                    fallback: payload.title,
                    color: color,
                    title: payload.title,
                    text: payload.message,
                    footer: `Source: ${payload.source}`,
                    ts: Math.floor(Date.now() / 1000)
                }]
            })
        });
    } catch (error) {
        console.error("[AlertSystem] Failed to send Slack alert", error);
    }
}

async function sendDiscordAlert(payload: AlertPayload) {
    try {
        const color = payload.severity === "CRITICAL" ? 16711680 : payload.severity === "WARNING" ? 16753920 : 65535;
        await fetch(process.env.DISCORD_WEBHOOK_URL!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                embeds: [{
                    title: payload.title,
                    description: payload.message,
                    color: color,
                    footer: { text: `Source: ${payload.source}` },
                    timestamp: new Date().toISOString()
                }]
            })
        });
    } catch (error) {
        console.error("[AlertSystem] Failed to send Discord alert", error);
    }
}

export async function sendDailyUsageReport(report: string) {
    await triggerAlert({
        title: "Daily Usage Report",
        message: report,
        severity: "INFO",
        source: "reporting-engine"
    });
}
