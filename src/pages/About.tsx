import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { 
  Laptop, 
  Users, 
  Recycle, 
  Globe, 
  ShieldCheck, 
  Heart, 
  ArrowRight,
  Target,
  Zap,
  Award,
  TrendingUp,
  Leaf,
  Sparkles,
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../components/layout/Logo";

const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemFade = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      {/* Hero Section - Editorial Style */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Parallax Elements */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-20 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] -z-10" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[120px] -z-10" 
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <Logo showText={false} size="sm" />
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-[0.3em]">About CompCharity</div>
                </div>
                <h1 className="text-[12vw] lg:text-[110px] font-bold tracking-tighter leading-[0.85] text-gray-900 mb-12">
                  Technology with <br />
                  <span className="text-blue-600 italic font-serif">Purpose.</span>
                </h1>
              </motion.div>
            </div>
            <div className="lg:col-span-4 pb-4">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-gray-500 font-medium leading-relaxed"
              >
                CompCharity is a social impact platform dedicated to bridging the digital divide in Ireland by transforming unused technology into opportunity.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tighter text-gray-900 mb-8">Connecting Realities</h2>
            <p className="text-2xl text-gray-500 font-medium leading-relaxed mb-8">
              In a world where access to technology defines access to education, employment, and growth, thousands are still left behind. At the same time, businesses hold large volumes of unused, recoverable devices.
            </p>
            <div className="flex items-center gap-4 text-blue-600 font-bold text-xl">
              <div className="w-12 h-1px bg-blue-600" />
              <span>We connect these two realities.</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Grid */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-5xl font-bold tracking-tighter text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-500 font-medium">A streamlined process designed for maximum social and environmental impact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Donate or Contribute",
                desc: "Businesses and individuals can donate unused devices, provide old tech for resale, or support sustainable reuse.",
                icon: Heart,
                color: "blue"
              },
              {
                step: "02",
                title: "Refurbish & Optimise",
                desc: "Each device is professionally restored and performance-optimised (Linux & lightweight systems) for safe reuse.",
                icon: ShieldCheck,
                color: "teal"
              },
              {
                step: "03",
                title: "Dual Impact Model",
                desc: "Direct donations go to students and NGOs, while resale funds more refurbishments and expanded reach.",
                icon: Zap,
                color: "orange"
              },
              {
                step: "04",
                title: "Corporate Partnerships",
                desc: "Companies donate equipment and receive AI & digital transformation insights, creating a double impact.",
                icon: Building2,
                color: "purple"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={itemFade}
                className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-7 h-7 text-${item.color}-600`} />
                  </div>
                  <span className="text-4xl font-bold text-gray-100 group-hover:text-blue-50 transition-colors">{item.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters - Visual Section */}
      <section className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <div className="aspect-square rounded-[64px] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80" 
                  alt="Students using technology"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 bg-white p-8 rounded-[32px] shadow-2xl border border-gray-50 hidden md:block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-gray-900 font-bold">Circular Economy</div>
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">Sustainability First</div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="space-y-12">
              <h2 className="text-5xl font-bold tracking-tighter text-gray-900">Why It Matters</h2>
              <div className="space-y-10">
                {[
                  {
                    title: "Social Impact",
                    desc: "Empowering students and communities with access to technology, opening doors to education and employment.",
                    icon: Users,
                    color: "blue"
                  },
                  {
                    title: "Environmental Impact",
                    desc: "Reducing e-waste and promoting a circular economy by extending the lifecycle of high-quality devices.",
                    icon: Recycle,
                    color: "green"
                  },
                  {
                    title: "Economic Impact",
                    desc: "Unlocking value from unused assets and creating new opportunities for growth in underserved areas.",
                    icon: TrendingUp,
                    color: "purple"
                  }
                ].map((impact, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-8 group"
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-${impact.color}-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <impact.icon className={`w-8 h-8 text-${impact.color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{impact.title}</h3>
                      <p className="text-lg text-gray-500 font-medium leading-relaxed">{impact.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision - Immersive Section */}
      <section className="py-32 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 blur-[120px] -z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <div className="text-xs font-bold text-blue-500 uppercase tracking-[0.3em] mb-8">Our Vision</div>
            <h2 className="text-6xl font-bold tracking-tighter mb-8">An Ireland where technology is <span className="text-blue-500 italic font-serif">universal.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { text: "Every student has access to technology", icon: Laptop },
              { text: "No usable device is wasted", icon: Recycle },
              { text: "Businesses actively support digital inclusion", icon: Globe }
            ].map((vision, i) => (
              <div key={i} className="p-12 bg-white/5 rounded-[48px] border border-white/10 hover:bg-white/10 transition-all text-center group">
                <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                  <vision.icon className="w-10 h-10 text-blue-500" />
                </div>
                <p className="text-2xl font-bold leading-tight">{vision.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Movement - CTA */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-[64px] p-16 md:p-24 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Logo showText={false} size="lg" />
            </div>
            <div className="max-w-xl relative z-10">
              <h2 className="text-5xl font-bold tracking-tighter text-gray-900 mb-6">Join the Movement</h2>
              <p className="text-2xl text-gray-500 font-medium mb-8">Every device matters. Every donation creates opportunity.</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" /> Help build the future
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 relative z-10">
              <Link
                to="/donate"
                className="bg-gray-900 text-white px-12 py-6 rounded-3xl font-bold text-lg hover:bg-blue-600 transition-all shadow-2xl shadow-gray-200 hover:shadow-blue-200 flex items-center gap-3 group"
              >
                Donate Tech
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="bg-white text-gray-900 border-2 border-gray-100 px-12 py-6 rounded-3xl font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all"
              >
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
