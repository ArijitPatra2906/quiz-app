import { create } from "zustand";
import { badgeCriteria } from "@/constants";

const useQuizStore = create((set) => ({
  quizData: [],
  currentQuestionIndex: 0,
  score: 0,
  streakCount: parseInt(localStorage.getItem("streakCount")) || 0,
  earnedBadges: JSON.parse(localStorage.getItem("badges")) || [],
  correctAnswers: 0,
  startTime: Date.now(),

  fetchQuizData: async () => {
    try {
      const response = await fetch("/api/proxy");
      const data = await response.json();
      set({ quizData: data.questions, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch quiz data", loading: false });
    }
  },

  submitAnswer: (isCorrect) =>
    set((state) => {
      const newScore = isCorrect ? state.score + 1 : state.score;
      let newStreak = isCorrect ? state.streakCount + 1 : 0;

      localStorage.setItem("streakCount", newStreak);

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
          localStorage.setItem("badges", JSON.stringify(newBadges));
        }

        if (newStreak === 10 && !newBadges.includes("streaker")) {
          newBadges.push("streaker");
          localStorage.setItem("badges", JSON.stringify(newBadges));
        }
      });

      if (isCorrect) {
        const timeElapsed = Math.floor((Date.now() - state.startTime) / 1000);
        if (timeElapsed <= 180) {
          state.correctAnswers += 1;
        }
      }

      if (state.correctAnswers === 10) {
        if (!newBadges.includes("speedster")) {
          newBadges.push("speedster");
          localStorage.setItem("badges", JSON.stringify(newBadges));
        }
      }

      return {
        score: newScore,
        streakCount: newStreak,
        earnedBadges: newBadges,
        correctAnswers: state.correctAnswers,
      };
    }),

  handleNext: () => {
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
    }));
  },
}));

export default useQuizStore;
