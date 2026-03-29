import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Laptop, Smartphone, Tablet, Monitor, ArrowRight, CheckCircle, Users, Globe, Recycle, ShieldCheck } from "lucide-react";

export default function Home() {
  const stats = [
    { label: "Devices Donated", value: "1,200+", icon: Laptop },
    { label: "Students Helped", value: "850+", icon: Users },
    { label: "E-Waste Diverted", value: "4.5 Tons", icon: Recycle },
    { label: "Data Wiped", value: "100%", icon: ShieldCheck },
  ];

  const steps = [
    { title: "Submit Details", description: "Tell us about your device and its condition.", icon: Laptop },
    { title: "Drop-off or Collection", description: "Choose a convenient way to get it to us.", icon: Globe },
    { title: "Refurbishment", description: "We wipe data and repair the device.", icon: CheckCircle },
    { title: "Impact", description: "Your tech helps someone in need.", icon: Users },
  ];

  return (
    <div className="overflow-hidden bg-white">
      {/* Hero Section - Split Layout (Recipe 11 inspired) */}
      <section className="relative min-h-[90vh] flex flex-col lg:flex-row">
        {/* Left Pane - Content */}
        <div className="flex-1 flex items-center px-4 sm:px-8 lg:px-16 py-20 lg:py-0 bg-white relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="inline-block px-4 py-1.5 mb-8 text-xs font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50 rounded-full border border-blue-100"
              >
                Tech for Good in Ireland
              </motion.span>
              <h1 className="text-6xl sm:text-7xl lg:text-[112px] font-bold tracking-tight text-gray-900 mb-8 leading-[0.88]">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="block"
                >
                  Empowering
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-blue-600 block"
                >
                  Communities
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="block"
                >
                  Digitally.
                </motion.span>
              </h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="text-xl text-gray-500 mb-12 leading-relaxed max-w-lg font-medium"
              >
                We turn unused technology into meaningful opportunities. Bridging the digital divide by refurbishing and donating tech to those in need.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-6"
              >
                <Link
                  to="/donate"
                  className="group relative flex items-center justify-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 overflow-hidden"
                >
                  <span className="relative z-10">Donate Your Tech</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <motion.div 
                    initial={false}
                    whileHover={{ scale: 1.5, opacity: 0.2 }}
                    className="absolute inset-0 bg-white/20 rounded-full blur-3xl -translate-x-full group-hover:translate-x-0 transition-transform duration-700"
                  />
                </Link>
                <Link
                  to="/resell"
                  className="group flex items-center justify-center gap-2 bg-white text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-2xl font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all"
                >
                  <span>Resell Your Tech</span>
                  <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Right Pane - Visuals (Atmospheric/Modern) */}
        <div className="flex-1 bg-gray-50 relative overflow-hidden min-h-[500px] lg:min-h-0">
          {/* Atmospheric Background (Recipe 7 inspired) */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px]" 
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [0, -90, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px]" 
            />
          </div>

          {/* Floating Elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: -6 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative z-20 bg-white p-12 rounded-[48px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-gray-100"
            >
              <Laptop className="w-48 h-48 text-blue-600" />
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-12 -right-12 bg-white p-6 rounded-3xl shadow-xl border border-gray-50"
              >
                <Smartphone className="w-12 h-12 text-blue-500" />
              </motion.div>
              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-12 -left-12 bg-white p-8 rounded-3xl shadow-xl border border-gray-50"
              >
                <Tablet className="w-16 h-16 text-blue-400" />
              </motion.div>
            </motion.div>

            {/* Decorative Rail Text (Recipe 11) */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block">
              <span className="writing-vertical-rl rotate-180 text-[11px] font-bold tracking-[0.5em] text-gray-300 uppercase">
                Sustainable Technology Solutions • Ireland • 2026
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section - Brutalist/Creative (Recipe 5 inspired) */}
      <section className="py-24 bg-gray-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 blur-[120px] -z-0" />
        <div className="flex whitespace-nowrap animate-marquee relative z-10">
          {[
            "Sustainable Technology", "Digital Inclusion", "E-Waste Reduction", 
            "Community Empowerment", "Data Security", "Circular Economy",
            "Sustainable Technology", "Digital Inclusion", "E-Waste Reduction", 
            "Community Empowerment", "Data Security", "Circular Economy"
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-12 mx-12">
              <span className="text-7xl lg:text-9xl font-bold tracking-tighter text-white/10 uppercase hover:text-blue-500 transition-colors cursor-default">
                {text}
              </span>
              <div className="w-4 h-4 rounded-full bg-blue-600" />
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section - Clean Utility (Recipe 8 inspired) */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-12"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                }}
                className="group"
              >
                <div className="text-[64px] font-light text-gray-900 mb-2 leading-none tracking-tighter">
                  {stat.value}
                </div>
                <div className="flex items-center gap-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: 40 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                    className="h-px bg-blue-600 group-hover:w-16 transition-all duration-500" 
                  />
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works - Visual Grid (Recipe 1 inspired) */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-8"
          >
            <div className="max-w-2xl">
              <h2 className="text-5xl font-bold tracking-tight text-gray-900 mb-8">The Lifecycle of Impact</h2>
              <p className="text-xl text-gray-500 leading-relaxed">Our process is transparent, secure, and designed to maximize social and environmental value at every stage.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-sm">01</div>
              <div className="w-12 h-12 rounded-full border border-blue-600 flex items-center justify-center text-blue-600 font-bold text-sm">04</div>
            </div>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200 rounded-[40px] overflow-hidden"
          >
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  show: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
                }}
                whileHover={{ backgroundColor: "#2563eb", transition: { duration: 0.3 } }}
                className="bg-white p-12 group transition-colors duration-500 cursor-default"
              >
                <div className="text-xs font-bold text-blue-600 group-hover:text-blue-200 mb-12 tracking-widest uppercase">Step 0{i + 1}</div>
                <motion.div 
                  whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                  className="mb-12"
                >
                  <step.icon className="w-12 h-12 text-gray-900 group-hover:text-white transition-colors" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-4 transition-colors">{step.title}</h3>
                <p className="text-gray-500 group-hover:text-blue-100 transition-colors leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Two Paths Section - Bold & High Contrast */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-blue-600 rounded-[64px] p-16 text-white relative overflow-hidden group cursor-pointer"
            >
              <div className="relative z-10">
                <span className="text-xs font-bold tracking-[0.3em] uppercase opacity-70 mb-8 block">Option One</span>
                <h3 className="text-5xl font-bold mb-8 leading-tight">Donate Your <br />Technology</h3>
                <p className="text-blue-100 mb-12 text-lg leading-relaxed max-w-md">
                  Securely wipe data, refurbish, and redirect equipment to educational and community use.
                </p>
                <Link
                  to="/donate"
                  className="inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-xl"
                >
                  Start Donation <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <Laptop className="absolute -bottom-20 -right-20 w-96 h-96 text-blue-500/20 group-hover:scale-110 transition-transform duration-700" />
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-gray-900 rounded-[64px] p-16 text-white relative overflow-hidden group cursor-pointer"
            >
              <div className="relative z-10">
                <span className="text-xs font-bold tracking-[0.3em] uppercase opacity-50 mb-8 block">Option Two</span>
                <h3 className="text-5xl font-bold mb-8 leading-tight">Send Tech <br />for Resale</h3>
                <p className="text-gray-400 mb-12 text-lg leading-relaxed max-w-md">
                  Maximize value from your high-end equipment. Proceeds support our charity mission.
                </p>
                <Link
                  to="/resell"
                  className="inline-flex items-center gap-3 bg-white text-gray-900 px-10 py-5 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-xl"
                >
                  Submit for Resale <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <Recycle className="absolute -bottom-20 -right-20 w-96 h-96 text-gray-800 group-hover:scale-110 transition-transform duration-700" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Business CTA - Split Layout Style */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[64px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col lg:flex-row">
            <div className="lg:w-3/5 p-16 lg:p-24">
              <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">Corporate Bulk <br />Donations</h2>
              <p className="text-xl text-gray-500 mb-12 max-w-xl leading-relaxed">
                Is your business upgrading its IT infrastructure? Partner with CompCharity for secure, ethical, and sustainable disposal of your old equipment. We provide full data destruction certificates and impact reporting.
              </p>
              <Link
                to="/contact?type=corporate"
                className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100"
              >
                Partner With Us <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="lg:w-2/5 bg-blue-600 p-16 flex items-center justify-center relative overflow-hidden">
              <div className="grid grid-cols-2 gap-6 relative z-10">
                {[Monitor, Laptop, ShieldCheck, Recycle].map((Icon, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.1, rotate: i % 2 === 0 ? 5 : -5 }}
                    className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-[32px] flex items-center justify-center border border-white/20"
                  >
                    <Icon className="w-12 h-12 text-white" />
                  </motion.div>
                ))}
              </div>
              {/* Decorative circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/10 rounded-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
