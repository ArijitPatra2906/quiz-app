export const badgeCriteria = {
  beginner: {
    label: "Beginner",
    description: "Answer 5 questions",
    threshold: 5,
    icon: "🏅",
  },
  master: {
    label: "Quiz Master",
    description: "Get 10 correct in a row",
    threshold: 10,
    icon: "🏆",
  },
  nightOwl: {
    label: "Night Owl",
    description: "Play at midnight 🌙",
    check: () => new Date().getHours() >= 0 && new Date().getHours() < 5,
    icon: "🌙",
  },
  streaker: {
    label: "Streaker",
    description: "Answer 10 questions correctly in a row",
    threshold: 10,
    icon: "🔥",
  },
};
