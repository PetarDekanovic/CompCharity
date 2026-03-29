import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, HelpCircle, ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch("/api/faq");
        const data = await response.json();
        setFaqs(data);
      } catch (error) {
        console.error("Failed to fetch FAQs");
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading FAQs</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-8">
                <HelpCircle className="w-4 h-4" />
                <span>Support Center</span>
              </div>
              <h1 className="text-7xl md:text-8xl font-bold tracking-tighter text-gray-900 leading-[0.85] mb-12">
                Frequently Asked <br />
                <span className="text-blue-600 italic font-serif">Questions.</span>
              </h1>
              <p className="text-2xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
                Everything you need to know about tech donation, resale, and our refurbishment process in Ireland.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-32 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-[40px] border transition-all duration-500 overflow-hidden ${
                openId === faq.id 
                  ? "border-blue-500 shadow-2xl shadow-blue-100/50" 
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full px-10 py-8 flex items-center justify-between text-left group"
              >
                <span className={`text-xl font-bold transition-colors ${openId === faq.id ? "text-blue-600" : "text-gray-900"}`}>
                  {faq.question}
                </span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  openId === faq.id ? "bg-blue-600 text-white rotate-180" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                }`}>
                  {openId === faq.id ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
              </button>
              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <div className="px-10 pb-10 text-lg text-gray-500 font-medium leading-relaxed border-t border-gray-50 pt-8">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {faqs.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[64px] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-gray-200">
                <HelpCircle className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No FAQs yet</h3>
              <p className="text-gray-500 font-medium">Check back soon for latest updates.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-[64px] p-16 md:p-24 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[120px] -z-0" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
                <MessageCircle className="w-4 h-4" />
                <span>Still Unsure?</span>
              </div>
              <h2 className="text-6xl font-bold tracking-tighter mb-8">Have more <span className="text-blue-500 italic font-serif">Questions?</span></h2>
              <p className="text-xl text-white/50 font-medium mb-12">Our team is here to help you with any specific enquiries about tech donation or resale.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link
                  to="/contact"
                  className="bg-blue-600 text-white px-12 py-6 rounded-3xl font-bold text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/40 flex items-center justify-center gap-3"
                >
                  Contact Us <ArrowRight className="w-6 h-6" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="bg-white text-gray-900 px-12 py-6 rounded-3xl font-bold text-lg hover:bg-gray-100 transition-all"
                >
                  How it Works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
