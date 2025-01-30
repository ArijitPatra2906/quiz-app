import { create } from "zustand";
import { persist } from "zustand/middleware";
import { badgeCriteria } from "@/constants";

const useQuizStore = create(
  persist(
    (set, get) => ({
      quizData: [],
      currentQuestionIndex: 0,
      score: 0,
      streakCount: 0, // Start with 0, update after hydration
      earnedBadges: [],
      correctAnswers: 0,
      startTime: null, // Avoid `Date.now()` on SSR

      fetchQuizData: async () => {
        try {
          const response = await fetch("/api/proxy");
          const data = await response.json();
          set({ quizData: data.questions, loading: false });
        } catch (error) {
          set({ error: "Failed to fetch quiz data", loading: false });
        }
      },

      submitAnswer: (isCorrect) => {
        set((state) => {
          const newScore = isCorrect ? state.score + 1 : state.score;
          let newStreak = isCorrect ? state.streakCount + 1 : 0;

          let newBadges = [...state.earnedBadges];
          Object.keys(badgeCriteria).forEach((badgeKey) => {
            const badge = badgeCriteria[badgeKey];

            if (
              !newBadges.includes(badgeKey) &&
              (badge.threshold
                ? newScore >= badge.threshold
                : badge.check && badge.check(state.timeElapsed))
            ) {
              newBadges.push(badgeKey);
            }

            if (newStreak === 10 && !newBadges.includes("streaker")) {
              newBadges.push("streaker");
            }
          });

          if (isCorrect) {
            const timeElapsed = Math.floor(
              (Date.now() - state.startTime) / 1000
            );
            if (timeElapsed <= 180) {
              state.correctAnswers += 1;
            }
          }

          if (state.correctAnswers === 10 && !newBadges.includes("speedster")) {
            newBadges.push("speedster");
          }

          return {
            score: newScore,
            streakCount: newStreak,
            earnedBadges: newBadges,
            correctAnswers: state.correctAnswers,
          };
        });
      },

      handleNext: () => {
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
        }));
      },
    }),
    {
      name: "quiz-storage", // LocalStorage key
      getStorage: () =>
        typeof window !== "undefined" ? localStorage : undefined, // Fix SSR issue
      partialize: (state) => ({
        streakCount: state.streakCount,
        earnedBadges: state.earnedBadges,
      }),
    }
  )
);

export default useQuizStore;
