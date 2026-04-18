import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, X, Loader2, Sparkles, User, Bot } from "lucide-react";
import { generateChatResponse } from "../../services/geminiService";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

const GeminiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await generateChatResponse(messages, input);
      const botMessage: Message = { role: "model", parts: [{ text: response || "I'm sorry, I couldn't generate a response." }] };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage: Message = { role: "model", parts: [{ text: "I'm having some trouble connecting right now. Please try again later." }] };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-200 flex items-center justify-center z-50 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageSquare className="w-8 h-8 relative z-10" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-white/20 rounded-full"
        />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 100, scale: 0.8, filter: "blur(10px)" }}
            className="fixed bottom-32 right-8 w-[400px] h-[600px] bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl shadow-blue-200/50 border border-gray-100 dark:border-gray-800 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-gray-900 text-white flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-lg">CompCharity AI</div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Online & Ready
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center">
                    <Bot className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                  <div className="max-w-[200px]">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Hello! I'm your CompCharity assistant.</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ask me anything about donating or reselling your tech!</p>
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-gray-100 dark:bg-gray-800" : "bg-blue-600"
                  }`}>
                    {msg.role === "user" ? <User className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <Sparkles className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-gray-900 dark:bg-blue-600 text-white rounded-tr-none" 
                      : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700"
                  }`}>
                    {msg.parts[0].text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-3xl rounded-tl-none border border-gray-100 dark:border-gray-700">
                    <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 border-t border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full pl-6 pr-16 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-600"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-200"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                Powered by Gemini Intelligence
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GeminiChatbot;
