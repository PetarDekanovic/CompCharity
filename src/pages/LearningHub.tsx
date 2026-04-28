import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Code, 
  Globe, 
  Smartphone, 
  ArrowRight, 
  Sparkles, 
  Quote, 
  ChevronRight,
  BrainCircuit,
  Terminal,
  Cpu
} from "lucide-react";
import { Link } from "react-router-dom";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  quizzes: { id: string; title: string }[];
}

interface WiseQuote {
  id: string;
  content: string;
  author: string;
  category: string;
}

const LearningHub = () => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [quotes, setQuotes] = useState<WiseQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pathsRes, quotesRes] = await Promise.all([
          fetch("/api/learning/paths"),
          fetch("/api/learning/quotes")
        ]);
        const pathsData = await pathsRes.json();
        const quotesData = await quotesRes.json();
        setPaths(pathsData);
        setQuotes(quotesData);
      } catch (error) {
        console.error("Failed to fetch learning data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (quotes.length > 0) {
      const interval = setInterval(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [quotes]);

  const getIcon = (name: string) => {
    switch (name) {
      case "Code": return <Code className="w-6 h-6" />;
      case "Globe": return <Globe className="w-6 h-6" />;
      case "Smartphone": return <Smartphone className="w-6 h-6" />;
      case "Terminal": return <Terminal className="w-6 h-6" />;
      case "Cpu": return <Cpu className="w-6 h-6" />;
      default: return <BookOpen className="w-6 h-6" />;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Waking up the neurons...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] py-32 px-4 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-24 relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full -z-10" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 border border-blue-100 dark:border-blue-800"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Student Learning Hub</span>
          </motion.div>
          <h1 className="text-7xl lg:text-[100px] font-bold tracking-tighter leading-[0.85] text-gray-900 dark:text-white mb-12">
            Skill up. <br />
            <span className="text-blue-600 dark:text-blue-400 italic font-serif">Power on.</span>
          </h1>
          <p className="text-2xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-2xl">
            Free educational resources for students. Master core technologies and turn your refurbished tech into a career engine.
          </p>
        </header>

        {/* Wise Quotes Feature */}
        <section className="mb-32">
          <div className="bg-gray-900 dark:bg-black rounded-[48px] p-12 lg:p-20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[100px] -z-0" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <Quote className="w-16 h-16 text-blue-600 mb-12 opacity-50" />
              <div className="h-[200px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {quotes.length > 0 && (
                    <motion.div
                      key={currentQuoteIndex}
                      initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                      transition={{ duration: 0.8 }}
                      className="max-w-4xl"
                    >
                      <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-8">
                        "{quotes[currentQuoteIndex].content}"
                      </h2>
                      <div className="text-blue-400 font-bold tracking-widest uppercase text-sm">
                        — {quotes[currentQuoteIndex].author}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex gap-2 mt-12">
                {quotes.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuoteIndex(i)}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      currentQuoteIndex === i ? "w-8 bg-blue-600" : "w-2 bg-gray-700 hover:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Learning Paths Grid */}
        <section className="mb-32">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
            <h2 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white max-w-xl">
              Choose your path to <span className="text-blue-600">mastery.</span>
            </h2>
            <div className="flex items-center gap-4 text-gray-400 font-bold uppercase tracking-widest text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Interactive Quizzes & More</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paths.map((path, i) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group p-10 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 hover:border-blue-500 transition-all shadow-sm hover:shadow-[0_40px_80px_-15px_rgba(59,130,246,0.1)] flex flex-col h-full"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform text-blue-600 dark:text-blue-400">
                  {getIcon(path.icon)}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors">
                  {path.title}
                </h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-auto">
                  {path.description}
                </p>
                
                <div className="mt-12 pt-12 border-t border-gray-50 dark:border-gray-800 space-y-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest inline-block mb-2">Available Quizzes:</span>
                  {path.quizzes.map((quiz) => (
                    <Link
                      key={quiz.id}
                      to={`/quiz/${quiz.id}`}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all group/item"
                    >
                      <span className="font-bold">{quiz.title}</span>
                      <ChevronRight className="w-4 h-4 group-hover/item:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section>
          <div className="bg-blue-600 rounded-[64px] p-16 md:p-24 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-black/10 -z-0" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-5xl font-bold tracking-tighter mb-8 leading-[0.9]">
                Ready to level up <br /> your <span className="italic font-serif opacity-80">career?</span>
              </h2>
              <p className="text-xl opacity-80 font-medium mb-12 leading-relaxed">
                Our learning dashboard is just the beginning. Connect with our community and discover how to build the future.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link
                  to="/contact"
                  className="bg-white text-blue-600 px-12 py-6 rounded-3xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl flex items-center justify-center gap-3"
                >
                  Join Community <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LearningHub;
