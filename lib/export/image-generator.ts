import { toPng, toJpeg } from "html-to-image";

export type ExportFormat = "png" | "jpeg";

interface ExportOptions {
    quality?: number;
    backgroundColor?: string;
    width?: number;
    height?: number;
}

/**
 * Converts a DOM element to an image and triggers a download.
 */
export async function exportElementAsImage(
    element: HTMLElement,
    filename: string,
    format: ExportFormat = "png",
    options: ExportOptions = {}
): Promise<void> {
    const { quality = 0.95, backgroundColor = "#0A0F14" } = options;

    try {
        const dataUrl = format === "png"
            ? await toPng(element, { backgroundColor, ...options })
            : await toJpeg(element, { quality, backgroundColor, ...options });

        const link = document.createElement("a");
        link.download = `${filename}.${format}`;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error("Image generation failed:", error);
        throw new Error("Failed to generate image.");
    }
}

/**
 * Returns the data URL of a DOM element as an image (for PDF embedding).
 */
export async function getElementDataUrl(
    element: HTMLElement,
    format: ExportFormat = "png"
): Promise<string> {
    try {
        return format === "png" ? await toPng(element) : await toJpeg(element);
    } catch (error) {
        console.error("Failed to get element data URL:", error);
        throw new Error("Failed to capture element.");
    }
}
