import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { 
  Laptop, 
  ShieldCheck, 
  Heart, 
  Leaf, 
  ArrowRight, 
  CheckCircle2,
  Package,
  Truck,
  Sparkles,
  Globe,
  Zap,
  MapPin,
  Search,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import SubmissionForm from "../components/forms/SubmissionForm";
import Logo from "../components/layout/Logo";
import { findDropOffPoints } from "../services/geminiService";
import { toast } from "sonner";

const Donate = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ text: string; groundingChunks: any[] } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    setIsSearching(true);
    try {
      const result = await findDropOffPoints(location);
      setSearchResult(result);
    } catch (error) {
      console.error("Search Error:", error);
      toast.error("Failed to find drop-off points.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Advanced Graphic Design Background Elements */}
        <div className="absolute inset-0 bg-gray-50/50 dark:bg-gray-950/50 -z-10" />
        
        {/* Parallax Blobs */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-20 -left-20 w-96 h-96 bg-blue-400/10 dark:bg-blue-900/20 rounded-full blur-[100px] -z-10" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-teal-400/10 dark:bg-purple-900/20 rounded-full blur-[120px] -z-10" 
        />

        {/* Floating Logo without text */}
        <motion.div
          style={{ y: y1, rotate: rotate1, opacity: opacity1 }}
          className="absolute top-40 right-[10%] opacity-20 -z-10 hidden lg:block"
        >
          <Logo showText={false} size="lg" />
        </motion.div>

        {/* Floating Icons with Parallax */}
        <motion.div
          style={{ y: y2 }}
          className="absolute top-1/4 left-[5%] p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-50 dark:border-gray-800 -z-10 hidden xl:block"
        >
          <Globe className="w-8 h-8 text-blue-500" />
        </motion.div>
        
        <motion.div
          style={{ y: y1 }}
          className="absolute bottom-1/4 right-[5%] p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-50 dark:border-gray-800 -z-10 hidden xl:block"
        >
          <Zap className="w-8 h-8 text-teal-500" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
                <Sparkles className="w-4 h-4" />
                <span>Make an Impact Today</span>
              </div>
              <h1 className="text-7xl font-bold tracking-tighter text-gray-900 dark:text-white leading-[0.9] mb-8">
                Your Old Tech, <br />
                <span className="text-blue-600 dark:text-blue-400">Their New Future.</span>
              </h1>
              <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-12 max-w-lg">
                Donating your unused laptops, tablets, and smartphones helps bridge the digital divide in Ireland while protecting the environment.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#donation-form"
                  className="bg-gray-900 dark:bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-2xl shadow-gray-200 dark:shadow-none flex items-center justify-center gap-2 group"
                >
                  Start Donation
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#how-it-works"
                  className="px-10 py-5 rounded-2xl font-bold text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-800 hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center justify-center"
                >
                  Learn Process
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80" 
                  alt="Students using laptops"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-12 left-12 right-12">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-lg">Social Impact</div>
                        <div className="text-white/60 text-sm font-medium">Directly helping local students</div>
                      </div>
                    </div>
                    <div className="text-white/80 text-sm leading-relaxed">
                      "The laptop I received through CompCharity changed my life. I can finally keep up with my college assignments."
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-xl border border-gray-50 hidden sm:block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-gray-900 font-bold">Eco-Friendly</div>
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">Zero Waste Policy</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-32 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white mb-6">Why Donate to Us?</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">We ensure your donation makes the maximum possible impact while keeping your data safe.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Certified Data Erasure",
                desc: "We use military-grade software to permanently wipe all your personal data before refurbishment.",
                color: "blue"
              },
              {
                icon: Truck,
                title: "Free Nationwide Pickup",
                desc: "For bulk donations or high-value items, we offer free collection across all of Ireland.",
                color: "purple"
              },
              {
                icon: CheckCircle2,
                title: "Tax Deductible",
                desc: "As a registered charity, your donation is eligible for tax relief, benefiting both you and the community.",
                color: "green"
              }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 rounded-[40px] bg-gray-50 dark:bg-gray-900 border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <benefit.icon className={`w-8 h-8 text-${benefit.color}-600 dark:text-${benefit.color}-400`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{benefit.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="donation-form" className="py-32 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4 space-y-8">
              <h2 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">Ready to Donate?</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Fill out the form to start your donation process. Our team will review your submission and contact you within 24-48 hours.
              </p>
              <div className="p-8 bg-blue-600 rounded-[32px] text-white shadow-2xl shadow-blue-200 dark:shadow-none">
                <h3 className="text-2xl font-bold mb-4">Business Donation?</h3>
                <p className="text-blue-100 font-medium mb-8 leading-relaxed">
                  For bulk donations from companies, please use our business partnership form for specialized handling and tax documentation.
                </p>
                <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-colors">
                  Contact Business Team
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="bg-white dark:bg-gray-900 p-10 md:p-16 rounded-[48px] shadow-2xl shadow-gray-200 dark:shadow-none border border-gray-100 dark:border-gray-800">
                <SubmissionForm type="DONATION" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find Drop-off Points */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-[64px] p-12 md:p-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-blue-600/10 blur-[100px] -z-0" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-8">
                  <MapPin className="w-4 h-4" />
                  <span>Local Hubs</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-white mb-8 leading-[0.9]">
                  Find a <br />
                  <span className="text-blue-500 italic font-serif">Drop-off Point.</span>
                </h2>
                <p className="text-xl text-white/50 font-medium leading-relaxed mb-12 max-w-md">
                  Enter your city or county in Ireland to find the nearest CompCharity hub or partner recycling center.
                </p>

                <form onSubmit={handleSearch} className="relative max-w-md">
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Dublin 2, Cork City, Galway..."
                    className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-3xl text-white font-medium focus:outline-none focus:bg-white/10 focus:border-blue-500 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={isSearching}
                    className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </form>
              </div>

              <div className="min-h-[300px]">
                <AnimatePresence mode="wait">
                  {searchResult ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-xl">
                        <div className="text-white/80 text-lg leading-relaxed mb-8">
                          {searchResult.text}
                        </div>
                        
                        {searchResult.groundingChunks.length > 0 && (
                          <div className="space-y-4">
                            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Verified Locations</div>
                            <div className="grid grid-cols-1 gap-3">
                              {searchResult.groundingChunks.map((chunk: any, i: number) => (
                                chunk.web && (
                                  <a 
                                    key={i}
                                    href={chunk.web.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group"
                                  >
                                    <span className="text-white font-bold text-sm truncate pr-4">{chunk.web.title}</span>
                                    <ExternalLink className="w-4 h-4 text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                  </a>
                                )
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/10 rounded-[40px]"
                    >
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <MapPin className="w-10 h-10 text-white/20" />
                      </div>
                      <p className="text-white/30 font-medium">Search results will appear here</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="how-it-works" className="py-32 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-6xl font-bold tracking-tighter mb-12">The Donation <br /><span className="text-blue-500">Journey</span></h2>
              <div className="space-y-12">
                {[
                  { step: "01", title: "Submit Details", desc: "Tell us about the device you want to donate through our simple online form." },
                  { step: "02", title: "Ship or Pickup", desc: "Drop it off at a local hub or schedule a free pickup for qualifying items." },
                  { step: "03", title: "Refurbishment", desc: "Our tech experts wipe data, repair hardware, and install fresh software." },
                  { step: "04", title: "Direct Impact", desc: "The device is delivered to a student, school, or community center in need." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="text-4xl font-bold text-white/10 group-hover:text-blue-500 transition-colors duration-500">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                      <p className="text-white/50 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[64px] bg-blue-600/10 border border-blue-500/20 p-12 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full border-2 border-dashed border-blue-500/30 rounded-full flex items-center justify-center"
                >
                  <div className="w-3/4 h-3/4 border-2 border-dashed border-blue-500/50 rounded-full flex items-center justify-center">
                    <div className="w-1/2 h-1/2 bg-blue-600 rounded-full shadow-[0_0_100px_rgba(37,99,235,0.5)] flex items-center justify-center">
                      <Package className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </motion.div>
                
                {/* Floating Icons */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-20 right-20 w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center"
                >
                  <Laptop className="w-10 h-10 text-blue-600" />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-20 left-20 w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center"
                >
                  <Truck className="w-10 h-10 text-blue-600" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Donate;
