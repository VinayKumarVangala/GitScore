"use client";

import { useState, useEffect, useCallback } from "react";

export type LoadingStepId = "aura" | "score" | "recommendations" | "finalizing";

export interface LoadingStep {
    id: LoadingStepId;
    label: string;
    duration: number; // minimum display time in ms
}

const DEFAULT_STEPS: LoadingStep[] = [
    { id: "aura", label: "Gathering GitHub aura...", duration: 2000 },
    { id: "score", label: "Calculating mystical score...", duration: 2500 },
    { id: "recommendations", label: "Summoning recommendations...", duration: 2000 },
    { id: "finalizing", label: "Finalizing portal...", duration: 1500 },
];

const LOADING_FACTS = [
    "Octocats are known to possess hidden mystical powers.",
    "Your code pulse resonates with the cyan frequency.",
    "Commits on full moons are 20% more potent.",
    "Analyzing the alignment of your repositories...",
    "The stars suggest a high community impact score.",
    "Deciphering the ancient languages of your READMEs...",
    "Calculating the velocity of your contribution spirit...",
];

export function useLoadingSequence(steps: LoadingStep[] = DEFAULT_STEPS) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [activeMessage, setActiveMessage] = useState(LOADING_FACTS[0]);
    const [isComplete, setIsComplete] = useState(false);

    const startSequence = useCallback(() => {
        let stepIdx = 0;
        let stopSequence = false;

        const processStep = async () => {
            if (stepIdx >= steps.length || stopSequence) {
                setIsComplete(true);
                return;
            }

            setCurrentStepIndex(stepIdx);

            // Update fact every few seconds within a step if needed
            const factInterval = setInterval(() => {
                setActiveMessage(LOADING_FACTS[Math.floor(Math.random() * LOADING_FACTS.length)]);
            }, 4000);

            const step = steps[stepIdx];
            const startTime = Date.now();

            // Smooth progress animation for this step
            const updateProgress = () => {
                const elapsed = Date.now() - startTime;
                const stepProgress = Math.min(elapsed / step.duration, 1);

                // Calculate overall progress
                const overallBase = (stepIdx / steps.length) * 100;
                const overallIncrement = (stepProgress / steps.length) * 100;
                setProgress(Math.round(overallBase + overallIncrement));

                if (elapsed < step.duration && !stopSequence) {
                    requestAnimationFrame(updateProgress);
                } else {
                    clearInterval(factInterval);
                    stepIdx++;
                    processStep();
                }
            };

            requestAnimationFrame(updateProgress);
        };

        processStep();

        return () => {
            stopSequence = true;
        };
    }, [steps]);

    return {
        currentStepIndex,
        currentStep: steps[currentStepIndex],
        progress,
        activeMessage,
        isComplete,
        startSequence,
        steps
    };
}
