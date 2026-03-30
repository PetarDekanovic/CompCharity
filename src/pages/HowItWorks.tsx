import React from "react";
import { motion } from "motion/react";
import { 
  Laptop, 
  ClipboardList, 
  Truck, 
  Recycle, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  Heart,
  Search,
  Settings,
  Globe,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Submit Details",
      desc: "Fill out our simple form with your device details and photos. We accept laptops, desktops, phones, and more.",
      icon: ClipboardList,
      color: "blue",
    },
    {
      step: "02",
      title: "Secure Collection",
      desc: "Choose to drop off your device at one of our hubs or request a secure collection from your home or office.",
      icon: Truck,
      color: "purple",
    },
    {
      step: "03",
      title: "Data Wiping & Repair",
      desc: "Our technicians perform professional data wiping and refurbish the device to its best possible condition.",
      icon: ShieldCheck,
      color: "green",
    },
    {
      step: "04",
      title: "Impactful Deployment",
      desc: "Refurbished devices are donated to students and communities in need across Ireland.",
      icon: Heart,
      color: "red",
    },
  ];

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
                <Sparkles className="w-4 h-4" />
                <span>Our Process</span>
              </div>
              <h1 className="text-7xl md:text-8xl font-bold tracking-tighter text-gray-900 dark:text-white leading-[0.85] mb-12">
                Simple. Secure. <br />
                <span className="text-blue-600 dark:text-blue-400 italic font-serif">Impactful.</span>
              </h1>
              <p className="text-2xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">
                Our streamlined process ensures your old technology makes the biggest possible difference while keeping your data safe.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Grid */}
      <section className="py-32 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-[48px] overflow-hidden shadow-2xl shadow-gray-100 dark:shadow-none">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-900 p-12 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="text-5xl font-bold text-gray-100 dark:text-gray-800 group-hover:text-blue-600/10 dark:group-hover:text-blue-400/10 transition-colors mb-8">
                  {step.step}
                </div>
                <div className={`w-16 h-16 rounded-2xl bg-${step.color}-50 dark:bg-${step.color}-900/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <step.icon className={`w-8 h-8 text-${step.color}-600 dark:text-${step.color}-400`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="py-32 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-48">
            {/* Donation Path */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-8">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 dark:shadow-none">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">The Donation Path</h2>
                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  Old laptops, computers, tablets, servers, and networking equipment can be donated. We securely wipe the data, refurbish the devices, and redirect them to educational, community, and charitable use.
                </p>
                <ul className="space-y-4">
                  {[
                    "Laptops & Desktops (Less than 7 years old)",
                    "Tablets & Smartphones",
                    "Networking Equipment",
                    "Monitors & Peripherals"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-900 dark:text-white font-bold">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-[64px] overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80" 
                    alt="Refurbished laptop"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-10 -left-10 bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-xl border border-gray-50 dark:border-gray-800 max-w-xs">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">100%</div>
                  <div className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Digital Inclusion Focus</div>
                </div>
              </div>
            </div>

            {/* Resale Path */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="aspect-[4/3] rounded-[64px] overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80" 
                    alt="Resale tech"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -top-10 -right-10 bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-xl border border-gray-50 dark:border-gray-800 max-w-xs">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">ROI</div>
                  <div className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Maximize Asset Value</div>
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-8">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-200 dark:shadow-none">
                  <Recycle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">The Resale Path</h2>
                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  If your equipment still has market value, we can sell it on your behalf. After the sale, you can receive the proceeds, while a percentage supports our charity work.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">Fair Market</div>
                    <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Valuation</div>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">Global</div>
                    <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Resale Network</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Security - Dark Mode */}
      <section className="py-32 bg-gray-900 dark:bg-black text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 blur-[120px] -z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                <span>Security First</span>
              </div>
              <h2 className="text-6xl font-bold tracking-tighter leading-tight">Your Data is <br /><span className="text-blue-500 italic font-serif">100% Secure.</span></h2>
              <p className="text-xl text-white/50 font-medium leading-relaxed">
                We take data privacy extremely seriously. Every storage device undergoes a professional multi-pass data wiping process using industry-standard software.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: "NIST 800-88", desc: "Compliant Wiping" },
                  { title: "Physical Destruction", desc: "For Damaged Drives" },
                  { title: "Full Audit Trail", desc: "For Every Device" },
                  { title: "Certification", desc: "Provided for Bulk" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{item.title}</div>
                      <div className="text-xs font-bold text-white/30 uppercase tracking-widest">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="w-full aspect-square rounded-[64px] bg-white/5 border border-white/10 flex items-center justify-center relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <ShieldCheck className="w-48 h-48 text-blue-500 animate-pulse relative z-10" />
                
                {/* Decorative Elements */}
                <div className="absolute top-12 left-12 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                <div className="absolute bottom-12 right-12 w-2 h-2 bg-blue-500 rounded-full animate-ping delay-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 dark:bg-gray-950 rounded-[64px] p-16 md:p-24 text-center text-white relative overflow-hidden border border-transparent dark:border-gray-800">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-6xl font-bold tracking-tighter mb-8">Ready to make a difference?</h2>
              <p className="text-xl text-white/50 font-medium mb-12">Join thousands of Irish donors making a difference in the digital age.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link
                  to="/donate"
                  className="bg-blue-600 text-white px-12 py-6 rounded-3xl font-bold text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/40 dark:shadow-none"
                >
                  Donate Tech
                </Link>
                <Link
                  to="/resell"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-12 py-6 rounded-3xl font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  Resell Tech
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
