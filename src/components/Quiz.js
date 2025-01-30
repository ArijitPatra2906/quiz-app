import useQuizStore from "@/store/useQuizStore";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Howl } from "howler";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { badgeCriteria } from "@/constants";
import useMounted from "@/hooks/useMounted";

const correctSound = new Howl({
  src: ["/sounds/correct.wav"],
  volume: 0.5,
});

const wrongSound = new Howl({
  src: ["/sounds/incorrect.mp3"],
  volume: 0.5,
});

const cleanText = (input) => {
  const cleaned = input
    .replace(/\*/g, "")
    .replace(
      /(Answer|Explanation|Detailed Explanation|Additional Context|Relevance to NEET Exam|Why is the answer correct):/g,
      ""
    )
    .replace(/^\s+|\s+$/g, "");

  return cleaned;
};

export default function Quiz() {
  const {
    quizData,
    currentQuestionIndex,
    submitAnswer,
    handleNext,
    streakCount,
    earnedBadges,
  } = useQuizStore();
  const mounted = useMounted();

  const [showConfetti, setShowConfetti] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [explanation, setExplanation] = useState("");
  const { width, height } = useWindowSize();
  const [timeRemaining, setTimeRemaining] = useState(10 * 60);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const currentQuestion = quizData[currentQuestionIndex];

  const handleAnswerSubmit = (option) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(option);

    const correctOption = currentQuestion.options.find((opt) => opt.is_correct);
    setCorrectAnswer(correctOption.description);

    if (option.is_correct) {
      correctSound.play();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      wrongSound.play();
      setExplanation(
        currentQuestion.detailed_solution || "No explanation available."
      );
    }

    submitAnswer(option.is_correct);
  };

  useEffect(() => {
    if (isTimeUp) return;
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          window.location.reload();
          alert("10 minutes have passed!");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimeUp]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 text-white rounded-xl w-full max-w-lg"
    >
      <div className="flex justify-between text-sm text-gray-700 mb-2">
        <p>Time Remaining: {isTimeUp ? "00:00" : formatTime(timeRemaining)}</p>
        <p>🔥 Streak: {streakCount}</p>
      </div>

      {showConfetti && <Confetti width={width} height={height} />}
      <h2 className="text-xl font-bold text-black">
        {currentQuestion.description}
      </h2>

      <div className="mt-6 space-y-4">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer?.description === option.description;
          const isCorrect = option.is_correct;
          const borderColor = isAnswered
            ? isSelected
              ? isCorrect
                ? "border-green-500 bg-green-200"
                : "border-red-500 bg-red-300"
              : "border-gray-400"
            : "border-gray-400";

          return (
            <motion.button
              key={index}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className={`block w-full py-2 px-5 text-lg font-semibold bg-gray-200 text-gray-900 rounded-3xl border ${borderColor} transition-all hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={() => handleAnswerSubmit(option)}
              disabled={isAnswered}
            >
              {option.description}
            </motion.button>
          );
        })}
      </div>

      {isAnswered && (
        <div
          className={`mt-4 border p-3 rounded-xl ${
            selectedAnswer?.is_correct
              ? "text-green-500 border-green-400"
              : "text-red-500 border-red-400"
          }`}
        >
          <p className="font-bold">Correct Answer: {correctAnswer}</p>
          {!selectedAnswer?.is_correct && (
            <div>
              <span>
                Explanation:
                <div
                  dangerouslySetInnerHTML={{ __html: cleanText(explanation) }}
                ></div>
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end mt-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          className="py-2 px-5 text-lg font-semibold bg-gray-200 text-gray-900 rounded-3xl border border-gray-400 transition-all hover:bg-gray-300"
          onClick={() => {
            handleNext();
            setIsAnswered(false);
            setSelectedAnswer(null);
            setShowConfetti(false);
            setCorrectAnswer(null);
          }}
        >
          Next
        </motion.button>
      </div>

      <div className="mt-4 text-gray-800">
        <h3 className="text-lg font-bold">🏆 Earned Badges</h3>
        <div className="flex gap-3 mt-4">
          {earnedBadges.length > 0 ? (
            earnedBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-gray-900 border p-2 rounded-xl"
              >
                <div className="flex flex-col items-center space-x-1">
                  <span className="text-2xl">{badgeCriteria[badge].icon}</span>
                  <span className="text-xs font-semibold">
                    {badgeCriteria[badge].label}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>No badges earned yet. Keep playing!</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
