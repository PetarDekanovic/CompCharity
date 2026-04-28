import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  RefreshCcw, 
  Trophy,
  BrainCircuit,
  MessageCircleQuestion,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  learningPath: { title: string };
}

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0); // 0: Start, 1: Quiz, 2: Result
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/learning/quizzes/${id}`);
        const data = await res.json();
        setQuiz(data);
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
        toast.error("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleStart = () => setCurrentStep(1);

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setAnswers([...answers, index]);
    setShowExplanation(true);

    if (index === quiz?.questions[currentQuestionIndex].answerIndex) {
      setScore(score + 1);
      toast.success("Correct!", { duration: 1500 });
    } else {
      toast.error("Incorrect", { duration: 1500 });
    }
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setCurrentStep(2);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setAnswers([]);
    setShowExplanation(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!quiz) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Quiz not found</h2>
        <Link to="/learning" className="text-blue-600 font-bold hover:underline">Back to Learning Hub</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] py-32 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/learning" className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hub</span>
        </Link>

        <AnimatePresence mode="wait">
          {/* STEP 0: Start Screen */}
          {currentStep === 0 && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-900 p-12 rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-xl text-center"
            >
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <BrainCircuit className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="mb-8">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full mb-4 inline-block">
                  {quiz.learningPath.title}
                </span>
                <h1 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white mb-6">
                  {quiz.title}
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  {quiz.description}
                </p>
              </div>
              <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-3xl mb-12 flex justify-between items-center text-left">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Questions</div>
                  <div className="text-xl font-bold">{quiz.questions.length} Concepts</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">XP Potential</div>
                  <div className="text-xl font-bold">{quiz.questions.length * 10} Points</div>
                </div>
              </div>
              <button
                onClick={handleStart}
                className="w-full bg-blue-600 text-white py-6 rounded-3xl font-bold text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-3"
              >
                Start Training <ChevronRight className="w-6 h-6" />
              </button>
            </motion.div>
          )}

          {/* STEP 1: Quiz Interaction */}
          {currentStep === 1 && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              {/* Progress Bar */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-6">
                <div className="text-sm font-bold text-gray-400 whitespace-nowrap uppercase tracking-widest">
                  {currentQuestionIndex + 1} / {quiz.questions.length}
                </div>
                <div className="h-2 flex-grow bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                    className="h-full bg-blue-600"
                  />
                </div>
                <MessageCircleQuestion className="w-5 h-5 text-blue-600" />
              </div>

              {/* Question Card */}
              <div className="bg-white dark:bg-gray-900 p-10 lg:p-16 rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden relative">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 tracking-tight">
                  {quiz.questions[currentQuestionIndex].question}
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {quiz.questions[currentQuestionIndex].options.map((option, idx) => {
                    const isCorrect = idx === quiz.questions[currentQuestionIndex].answerIndex;
                    const isSelected = selectedOption === idx;
                    
                    let variantClasses = "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white";
                    if (selectedOption !== null) {
                      if (isCorrect) variantClasses = "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-500 shadow-xl shadow-green-100 dark:shadow-none";
                      else if (isSelected) variantClasses = "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-500";
                      else variantClasses = "opacity-50 grayscale bg-gray-50 dark:bg-gray-800";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={selectedOption !== null}
                        onClick={() => handleOptionSelect(idx)}
                        className={`p-6 rounded-[32px] text-left font-bold text-lg transition-all flex items-center justify-between border-2 border-transparent ${variantClasses}`}
                      >
                        <span>{option}</span>
                        {selectedOption !== null && isCorrect && <CheckCircle2 className="w-6 h-6 shrink-0" />}
                        {selectedOption !== null && isSelected && !isCorrect && <XCircle className="w-6 h-6 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-12 p-8 bg-blue-50 dark:bg-blue-900/20 rounded-[32px] border border-blue-100 dark:border-blue-800"
                    >
                      <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs mb-3">
                        <Lightbulb className="w-4 h-4" />
                        <span>Insight</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                        {quiz.questions[currentQuestionIndex].explanation || "Great job understanding this core concept!"}
                      </p>
                      
                      <button
                        onClick={handleNext}
                        className="mt-8 w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        {currentQuestionIndex < quiz.questions.length - 1 ? "Next Concept" : "Complete Training"} <ChevronRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Result Screen */}
          {currentStep === 2 && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 dark:bg-black p-12 lg:p-20 rounded-[64px] text-center text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[120px] -z-0" />
              <div className="relative z-10">
                <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-2xl rotate-12 group hover:rotate-0 transition-transform">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-6xl font-bold tracking-tighter mb-4">Bravo!</h1>
                <p className="text-blue-400 font-bold tracking-widest uppercase mb-12">Training Cycle Complete</p>
                
                <div className="grid grid-cols-2 gap-8 mb-16">
                  <div className="p-8 bg-white/5 rounded-[40px] border border-white/10">
                    <div className="text-5xl font-black mb-2 tracking-tighter">{score} / {quiz.questions.length}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Score</div>
                  </div>
                  <div className="p-8 bg-white/5 rounded-[40px] border border-white/10">
                    <div className="text-5xl font-black mb-2 tracking-tighter">{Math.round((score / quiz.questions.length) * 100)}%</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Accuracy</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <button
                    onClick={resetQuiz}
                    className="flex-1 bg-white text-gray-900 py-6 rounded-3xl font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-5 h-5" /> Retrain
                  </button>
                  <Link
                    to="/learning"
                    className="flex-1 bg-blue-600 text-white py-6 rounded-3xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center"
                  >
                    Next Pathway
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizPage;
