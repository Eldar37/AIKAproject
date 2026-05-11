import { create } from "zustand";

type AikaState = {
  aiMode: string;
  setAiMode: (mode: string) => void;
  growthScore: number;
  setGrowthScore: (score: number) => void;
};

export const useAikaStore = create<AikaState>((set) => ({
  aiMode: "START_MODE",
  setAiMode: (aiMode) => set({ aiMode }),
  growthScore: 0,
  setGrowthScore: (growthScore) => set({ growthScore })
}));
