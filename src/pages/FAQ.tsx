import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, HelpCircle, ArrowRight, Sparkles, MessageCircle, BarChart3, Recycle, Users, Laptop, ShieldCheck, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const IMPACT_DATA = [
  { name: 'Discarded Annually', value: 150000, color: '#ef4444' },
  { name: 'Students in Need', value: 45000, color: '#3b82f6' },
  { name: 'Refurbished Goal', value: 10000, color: '#10b981' },
];

const PIE_DATA = [
  { name: 'Landfill/Recycled', value: 75 },
  { name: 'Potential for Reuse', value: 25 },
];

const COLORS = ['#fee2e2', '#3b82f6'];

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
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Loading FAQs</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 border border-blue-100 dark:border-blue-800">
                <HelpCircle className="w-4 h-4" />
                <span>Support & Impact</span>
              </div>
              <h1 className="text-7xl md:text-8xl font-bold tracking-tighter text-gray-900 dark:text-white leading-[0.85] mb-12">
                Questions? <br />
                <span className="text-blue-600 dark:text-blue-400 italic font-serif">We have answers.</span>
              </h1>
              <p className="text-2xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">
                Discover how we are tackling the digital divide in Ireland, one device at a time.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Dashboard Section */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-6">
                <TrendingUp className="w-3 h-3" /> The Situation in Ireland
              </div>
              <h2 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white mb-8">
                A Problem We Can <br />No Longer <span className="text-red-500">Ignore.</span>
              </h2>
              <div className="space-y-8 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-800">
                    <Recycle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">E-Waste Crisis</h4>
                    <p className="text-gray-500 dark:text-gray-400">Over <span className="font-bold text-gray-900 dark:text-white">150,000 laptops</span> are discarded annually in Ireland, ending up in landfills or incomplete recycling cycles.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-800">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Educational Inequality</h4>
                    <p className="text-gray-500 dark:text-gray-400">Approximately <span className="font-bold text-gray-900 dark:text-white">45,000 students</span> across Ireland still lack access to a dedicated laptop for their studies.</p>
                  </div>
                </div>
              </div>
              
              {/* Metric Bento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 p-8 rounded-[32px] text-white">
                  <div className="text-4xl font-black mb-2 tracking-tighter">150K+</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discarded / Year</div>
                </div>
                <div className="bg-blue-600 p-8 rounded-[32px] text-white">
                  <div className="text-4xl font-black mb-2 tracking-tighter">45K+</div>
                  <div className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Students in Need</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-[48px] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-2xl">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scale Comparison</h3>
                <BarChart3 className="w-5 h-5 text-gray-300" />
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={IMPACT_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                              <p className="text-xl font-black text-gray-900 dark:text-white">{payload[0].value.toLocaleString()}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[12, 12, 12, 12]}>
                      {IMPACT_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">E-Waste Crisis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Digital Divide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured FAQ with Images */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" /> Sustainability Focus
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group relative rounded-[40px] overflow-hidden aspect-[4/5] bg-gray-100">
                <img 
                  src="https://picsum.photos/seed/laptop-circuit/800/1000" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  referrerPolicy="no-referrer"
                  alt="Refurbishment process"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-10 flex flex-col justify-end">
                  <h3 className="text-2xl font-bold text-white mb-2">Our Data Policy</h3>
                  <p className="text-white/60 text-sm font-medium">Every device undergoes military-grade data destruction before being repurposed.</p>
                </div>
              </div>
              <div className="group relative rounded-[40px] overflow-hidden aspect-[4/5] bg-gray-100">
                <img 
                  src="https://picsum.photos/seed/tablet-learning/801/1000" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  referrerPolicy="no-referrer"
                  alt="Tech impact"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/20 to-transparent p-10 flex flex-col justify-end">
                  <h3 className="text-2xl font-bold text-white mb-2">Community Impact</h3>
                  <p className="text-white/60 text-sm font-medium">Redirecting discarded tech to students who need it most across the country.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-[48px] p-10 border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex items-center justify-center mb-8">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight italic">Why we do it.</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
                Technology is the gateway to modern opportunity. In an increasingly AI-driven economy, lacking a computer is no longer just a disadvantage—it's a fundamental barrier to participation.
              </p>
              <ul className="space-y-4">
                {[
                  "Military-grade Data Wiping",
                  "Verified Student Recipients",
                  "Environmental Certificates",
                  "Full Lifecycle Monitoring"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-32 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">General Enquiries</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Most common questions about our platform and procedures.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white dark:bg-gray-900 rounded-[40px] border transition-all duration-500 overflow-hidden ${
                  openId === faq.id 
                    ? "border-blue-500 shadow-2xl shadow-blue-100/50 dark:shadow-none" 
                    : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                }`}
              >
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full px-10 py-8 flex items-center justify-between text-left group"
                >
                  <span className={`text-xl font-bold transition-colors ${openId === faq.id ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}>
                    {faq.question}
                  </span>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    openId === faq.id ? "bg-blue-600 text-white rotate-180" : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
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
                      <div className="px-10 pb-10 text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed border-t border-gray-50 dark:border-gray-800 pt-8">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {faqs.length === 0 && (
              <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-[64px] border border-dashed border-gray-200 dark:border-gray-800">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-gray-200 dark:shadow-none">
                  <HelpCircle className="w-10 h-10 text-gray-300 dark:text-gray-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No FAQs yet</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Check back soon for latest updates.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 dark:bg-gray-950 rounded-[64px] p-16 md:p-24 text-center text-white relative overflow-hidden border border-transparent dark:border-gray-800">
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
                  className="bg-blue-600 text-white px-12 py-6 rounded-3xl font-bold text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/40 dark:shadow-none flex items-center justify-center gap-3"
                >
                  Contact Us <ArrowRight className="w-6 h-6" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-12 py-6 rounded-3xl font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
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
