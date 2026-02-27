import { jsPDF } from "jspdf";
import { DetailedScorecard } from "@/lib/github/types";
import { getElementDataUrl } from "./image-generator";

interface PdfExportOptions {
    sections: {
        id: string;
        title: string;
    }[];
}

/**
 * Generates a professional PDF report from dashboard sections.
 */
export async function generatePdfReport(
    scorecard: DetailedScorecard,
    options: PdfExportOptions
): Promise<void> {
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = 20;

    // ─── Header ───
    pdf.setFillColor(10, 15, 20); // Mystical dark background
    pdf.rect(0, 0, pageWidth, 40, "F");

    pdf.setTextColor(0, 255, 255); // Cyan primary
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.text("GitScore Analysis Report", margin, 20);

    pdf.setTextColor(255, 255, 255, 0.5);
    pdf.setFontSize(10);
    pdf.text(`Explorer: ${scorecard.username} | Generated: ${new Date().toLocaleDateString()}`, margin, 30);

    cursorY = 50;

    // ─── Summary Section ───
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text("Coordinate Summary", margin, cursorY);
    cursorY += 10;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Total Score: ${scorecard.totalScore} / 100`, margin, cursorY);
    pdf.text(`Rank Grade: ${scorecard.grade}`, margin + 60, cursorY);
    cursorY += 15;

    // ─── Capturing and Adding Sections ───
    for (const section of options.sections) {
        const element = document.getElementById(section.id);
        if (!element) continue;

        try {
            // Add section title
            if (cursorY > 240) {
                pdf.addPage();
                cursorY = 20;
            }

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(14);
            pdf.text(section.title, margin, cursorY);
            cursorY += 5;

            const imgData = await getElementDataUrl(element, "png");
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

            if (cursorY + imgHeight > 280) {
                pdf.addPage();
                cursorY = 20;
            }

            pdf.addImage(imgData, "PNG", margin, cursorY, contentWidth, imgHeight);
            cursorY += imgHeight + 15;
        } catch (err) {
            console.error(`Failed to add section ${section.id}:`, err);
        }
    }

    // ─── Footer ───
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(150);
        pdf.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pdf.internal.pageSize.getHeight() - 10,
            { align: "center" }
        );
    }

    pdf.save(`GitScore_Report_${scorecard.username}.pdf`);
}
