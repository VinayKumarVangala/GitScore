import { useState } from "react";
import { motion } from "framer-motion";
import { FiShare2, FiDownload, FiRefreshCw, FiCode, FiTwitter, FiFileText } from "react-icons/fi";
import MysticalButton from "@/components/ui/MysticalButton";
import MysticalCard from "@/components/ui/MysticalCard";
import { DetailedScorecard, GitHubUser } from "@/lib/github/types";
import { generatePdfReport } from "@/lib/export/pdf-generator";
import { exportElementAsImage } from "@/lib/export/image-generator";
import ShareModal from "./ShareModal";
import WatchlistButton from "./WatchlistButton";

interface ActionButtonsProps {
    scorecard: DetailedScorecard;
    className?: string;
}

export default function ActionButtons({ scorecard, className = "" }: ActionButtonsProps) {
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const { username, totalScore, grade } = scorecard;

    const handlePdfExport = async () => {
        setIsExporting(true);
        try {
            await generatePdfReport(scorecard, {
                sections: [
                    { id: "dashboard-summary", title: "Overview aura" },
                    { id: "dashboard-categories", title: "Dimensional Alignment" },
                    { id: "dashboard-visuals", title: "Spectral Visualizations" },
                ],
            });
        } catch (err) {
            alert("Failed to generate PDF. Ritual interrupted.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleImageExport = async () => {
        const dashboard = document.getElementById("dashboard-summary");
        if (!dashboard) return;
        setIsExporting(true);
        try {
            await exportElementAsImage(dashboard, `GitScore_${username}`, "png");
        } catch (err) {
            alert("Failed to capture image shroud.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start ${className}`}>
                <div className="space-y-2">
                    <MysticalButton
                        variant="primary"
                        onClick={() => setIsShareOpen(true)}
                        className="gap-2 w-full"
                    >
                        <FiShare2 /> Share Rank
                    </MysticalButton>
                </div>

                <div className="space-y-2">
                    <MysticalButton
                        variant="secondary"
                        onClick={handlePdfExport}
                        isLoading={isExporting}
                        className="gap-2 w-full"
                    >
                        <FiFileText /> Export Report
                    </MysticalButton>
                </div>

                <div className="space-y-2">
                    <a
                        href={`https://www.github.com/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                    >
                        <MysticalButton
                            variant="primary"
                            className="gap-2 w-full bg-slate-800/50 hover:bg-slate-700/50 border-slate-600/50 text-slate-300"
                        >
                            <FiCode /> View Profile
                        </MysticalButton>
                    </a>
                </div>

                <div className="space-y-2">
                    <MysticalButton
                        variant="ghost"
                        className="gap-2 w-full border border-white/10 opacity-60 hover:opacity-100"
                        onClick={() => window.location.href = "/"}
                    >
                        <FiRefreshCw /> New Analysis
                    </MysticalButton>
                </div>
            </div>

            <ShareModal
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                username={username}
                score={totalScore}
            />
        </>
    );
}
