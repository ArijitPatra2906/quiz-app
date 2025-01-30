import useQuizStore from "@/store/useQuizStore";

export default function Result() {
  const { score, quizData } = useQuizStore();

  return (
    <div className="p-8 bg-white text-gray-800 rounded-lg max-w-md mx-auto text-center">
      <h2 className="text-4xl font-bold text-blue-600">🎉 Quiz Completed!</h2>
      <p className="text-xl mt-4 font-medium">
        Total Score: <span className="font-bold">{score * 10}</span> /{" "}
        {quizData.length * 10}
      </p>
      <button
        className="mt-6 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
        onClick={() => window.location.reload()}
      >
        🔄 Restart Quiz
      </button>
    </div>
  );
}
