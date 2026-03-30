import React from "react";
import SubmissionForm from "../components/forms/SubmissionForm";
import { motion } from "motion/react";
import { Recycle, Share2, ShieldCheck, ArrowRight, Sparkles, TrendingUp, Wallet } from "lucide-react";

const Resell = () => {
  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest mb-8">
                <TrendingUp className="w-4 h-4" />
                <span>Maximize Value</span>
              </div>
              <h1 className="text-7xl md:text-8xl font-bold tracking-tighter text-gray-900 dark:text-white leading-[0.85] mb-12">
                Resell Your <br />
                <span className="text-purple-600 dark:text-purple-400 italic font-serif">Tech.</span>
              </h1>
              <p className="text-2xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xl">
                Have a device with resale value? Submit it for our resale program. We'll handle the sale and share the proceeds.
              </p>
              
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-200 dark:shadow-none shrink-0">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Shared Proceeds</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Keep a portion or donate it all.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-900 dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-xl shadow-gray-200 dark:shadow-none shrink-0">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Secure Selling</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">We handle listing & data wiping.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-[64px] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80" 
                  alt="Modern workstation"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-xl border border-gray-50 dark:border-gray-800 max-w-xs">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Market Value</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">Top Tier Pricing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-32 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
            {/* Steps Sidebar */}
            <div className="lg:col-span-4 space-y-12">
              <div className="sticky top-32">
                <h2 className="text-4xl font-bold tracking-tighter text-gray-900 dark:text-white mb-12">How it works</h2>
                <div className="space-y-12">
                  {[
                    { step: "01", title: "Submit Details", desc: "Provide device info and clear photos." },
                    { step: "02", title: "Valuation", desc: "We provide a fair market estimate." },
                    { step: "03", title: "Collection", desc: "Drop-off or request a secure pickup." },
                    { step: "04", title: "Sale & Payout", desc: "We sell it and distribute the proceeds." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-8 group">
                      <div className="text-2xl font-bold text-gray-200 dark:text-gray-800 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-16 p-8 bg-gray-900 dark:bg-gray-800 rounded-[40px] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 blur-3xl" />
                  <h4 className="text-xl font-bold mb-4 relative z-10">Sustainable Lifecycle</h4>
                  <p className="text-white/50 font-medium mb-6 relative z-10">Extend the life of your device and reduce e-waste effectively.</p>
                  <div className="flex items-center gap-2 text-purple-400 font-bold relative z-10">
                    <Recycle className="w-5 h-5" />
                    <span>Eco-Friendly Choice</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Area */}
            <div className="lg:col-span-8">
              <div className="bg-white dark:bg-gray-900 rounded-[64px] p-12 md:p-20 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-12">
                    <h2 className="text-4xl font-bold tracking-tighter text-gray-900 dark:text-white mb-4">Device Submission</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Please provide as much detail as possible for an accurate valuation.</p>
                  </div>
                  <SubmissionForm type="RESALE" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">Why Resell with Us?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: ShieldCheck,
                title: "Certified Data Wiping",
                desc: "Every device undergoes NIST 800-88 compliant data destruction before resale."
              },
              {
                icon: Share2,
                title: "Transparent Process",
                desc: "Real-time tracking of your device status and clear breakdown of sale proceeds."
              },
              {
                icon: Sparkles,
                title: "Premium Refurbishment",
                desc: "Our technicians restore devices to peak condition to maximize their market value."
              }
            ].map((feature, i) => (
              <div key={i} className="text-center space-y-6">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-[32px] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <feature.icon className="w-10 h-10 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resell;
