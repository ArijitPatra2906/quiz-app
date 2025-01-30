"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useQuizStore from "@/store/useQuizStore";
import useMounted from "@/hooks/useMounted";
import Quiz from "@/components/Quiz";
import Result from "@/components/Result";

export default function Home() {
  const { quizData, fetchQuizData, currentQuestionIndex } = useQuizStore();
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(3);
  const mounted = useMounted();

  useEffect(() => {
    fetchQuizData();

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setLoading(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  const progress =
    quizData.length > 0 ? (currentQuestionIndex / quizData.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white text-gray-900 px-6 py-4 rounded-2xl shadow-lg flex flex-col items-center w-full max-w-lg max-h-[80vh] overflow-y-auto custom-scrollbar"
      >
        <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          🎮 Quiz App
        </h1>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="loader mt-8"
          >
            <div className="spinner"></div>
            <p className="mt-4 text-xl">⏳Quiz starting in {seconds}s</p>
          </motion.div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <p className="font-semibold text-gray-800">
              {currentQuestionIndex} / {quizData.length}
            </p>
            {currentQuestionIndex < quizData.length ? <Quiz /> : <Result />}
          </>
        )}
      </motion.div>
    </div>
  );
}
