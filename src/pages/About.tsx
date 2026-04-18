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
  Building2,
  Presentation,
  BarChart3,
  Lightbulb,
  Handshake
} from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../components/layout/Logo";
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

const eWasteData = [
  { name: 'Discarded (Landfill)', value: 82.6, color: '#ef4444' },
  { name: 'Formally Recycled', value: 17.4, color: '#10b981' },
];

const potentialValueData = [
  { year: '2020', value: 57 },
  { year: '2021', value: 62 },
  { year: '2022', value: 68 },
  { year: '2023', value: 75 },
  { year: '2024', value: 82 },
];

const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const itemFade = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Hero Section - Dargan Forum Presentation Style */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-20 -left-20 w-96 h-96 bg-blue-400/10 dark:bg-blue-900/20 rounded-full blur-[100px] -z-10" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-teal-400/10 dark:bg-purple-900/20 rounded-full blur-[120px] -z-10" 
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
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">Presented at Dargan Forum, Ireland</div>
                </div>
                <h1 className="text-[8vw] lg:text-[80px] font-bold tracking-tighter leading-[0.9] text-gray-900 dark:text-white mb-8">
                  Bridging the Digital Divide <br />
                  <span className="text-blue-600 dark:text-blue-400 italic font-serif">Through Purpose-Driven Technology.</span>
                </h1>
              </motion.div>
            </div>
            <div className="lg:col-span-4 pb-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <Presentation className="w-8 h-8 text-blue-600 mb-4" />
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  A professional, corporate, yet emotional commitment to transforming redundant technology into opportunity.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-24 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tighter text-gray-900 dark:text-white mb-8">A Problem We Can No Longer Ignore</h2>
              <div className="space-y-6 text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                <p>
                  Across Ireland and globally, we are witnessing a silent crisis—one that does not always make headlines, yet profoundly shapes the future of our society.
                </p>
                <p>
                  In an era where education, employment, and opportunity are increasingly digital, access to a computer is no longer a luxury—it is a necessity. Without it, students fall behind, communities become disconnected, and inequality deepens.
                </p>
                <p className="text-gray-900 dark:text-white font-bold">
                  CompCharity was created to bridge this gap.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-950 p-8 rounded-[48px] border border-gray-100 dark:border-gray-800">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  The Global E-Waste Crisis (%)
                </h3>
                <p className="text-sm text-gray-500">Only a fraction of technology is formally recycled.</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eWasteData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {eWasteData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-8 mt-4">
                {eWasteData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
              <Target className="w-4 h-4" /> Our Mission
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-12 leading-[0.9]">
              Turning Redundant Technology into <span className="italic font-serif opacity-80">Opportunity.</span>
            </h2>
            <blockquote className="text-2xl md:text-4xl font-medium italic border-l-4 border-white/30 pl-8 py-4 mb-12">
              "To transform unused technology into access, education, and opportunity for those who need it most."
            </blockquote>
            <p className="text-xl opacity-80 max-w-2xl mx-auto">
              We operate at the intersection of charity, sustainability, and technology, ensuring that every device we handle creates measurable social impact.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-24">
            <h2 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white mb-6">A Sustainable, Scalable Model</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">Designed to serve both donors and beneficiaries while ensuring long-term sustainability.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "1. Technology Collection",
                desc: "We partner with corporations, SMEs, public institutions, and individuals. Donors can choose between full donation or a resale partnership.",
                icon: Building2,
                color: "blue"
              },
              {
                title: "2. Refurbishment & Reengineering",
                desc: "Devices are assessed, repaired, and optimised. We extend lifespan through hardware restoration and secure data wiping.",
                icon: ShieldCheck,
                color: "teal"
              },
              {
                title: "3. Redistribution & Social Impact",
                desc: "Refurbished devices are donated to students from economically disadvantaged backgrounds and NGOs to support digital inclusion.",
                icon: Users,
                color: "orange"
              },
              {
                title: "4. Revenue Through Ethical Resale",
                desc: "Devices that cannot be donated directly are sold ethically. Proceeds fund further refurbishments and operational capacity.",
                icon: TrendingUp,
                color: "purple"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={itemFade}
                className="bg-white dark:bg-gray-900 p-12 rounded-[48px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-${item.color}-50 dark:bg-${item.color}-900/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-8 h-8 text-${item.color}-600 dark:text-${item.color}-400`} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters - Data Driven */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <h2 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">Why CompCharity Matters</h2>
              <div className="space-y-10">
                {[
                  {
                    title: "Digital Inequality",
                    desc: "We provide access to essential tools for education and employment, helping to level the playing field for underserved communities.",
                    icon: Globe,
                    color: "blue"
                  },
                  {
                    title: "Environmental Responsibility",
                    desc: "By extending the lifecycle of devices, we reduce e-waste and contribute to Ireland’s sustainability goals.",
                    icon: Leaf,
                    color: "green"
                  },
                  {
                    title: "Corporate Social Value",
                    desc: "We enable businesses to responsibly dispose of IT equipment and demonstrate measurable ESG commitment.",
                    icon: Award,
                    color: "purple"
                  }
                ].map((impact, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-8 group"
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-${impact.color}-50 dark:bg-${impact.color}-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <impact.icon className={`w-8 h-8 text-${impact.color}-600 dark:text-${impact.color}-400`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{impact.title}</h3>
                      <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{impact.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 p-12 rounded-[64px] text-white">
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                  Potential Value of E-Waste ($B)
                </h3>
                <p className="text-gray-400">The raw materials in discarded tech represent billions in untapped value.</p>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={potentialValueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis 
                      dataKey="year" 
                      stroke="#9ca3af" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `$${value}B`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      contentStyle={{ backgroundColor: '#111827', borderRadius: '16px', border: '1px solid #374151' }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#3b82f6" 
                      radius={[8, 8, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section className="py-32 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white mb-6">Beyond Charity: A New Ecosystem</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">A platform for collaboration and innovation, integrating AI and sustainable tech.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Digital Platform",
                desc: "Easy donation tracking and a knowledge hub focused on live commerce and sustainable tech.",
                icon: Laptop
              },
              {
                title: "AI-Driven Solutions",
                desc: "Optimising operations and outreach through advanced AI integration.",
                icon: Sparkles
              },
              {
                title: "SME Consultations",
                desc: "AI integration consultations for SMEs in exchange for unused technology.",
                icon: Lightbulb
              }
            ].map((feature, i) => (
              <div key={i} className="p-10 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 hover:border-blue-500 transition-colors group">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Scaling */}
      <section className="py-32 bg-gray-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="text-xs font-bold text-blue-500 uppercase tracking-[0.3em] mb-8">Our Vision</div>
              <h2 className="text-6xl font-bold tracking-tighter mb-8 leading-[0.9]">Scaling Impact Across Ireland <span className="text-blue-500 italic font-serif">and Beyond.</span></h2>
              <p className="text-2xl text-gray-400 font-medium mb-12">
                We envision a future where no student is left behind due to lack of access to technology.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-lg font-bold">Nationwide Partnerships</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-lg font-bold">Ethical Tech Brand</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-lg font-bold">Thousands Supported</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-lg font-bold">European Expansion</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-[48px] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80" 
                  alt="Modern laptop and study space"
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 text-center">
                  <Globe className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <div className="text-4xl font-bold">2027</div>
                  <div className="text-xs font-bold uppercase tracking-widest opacity-60">Target Scale</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call for Partnership */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 dark:bg-gray-900 rounded-[64px] p-16 md:p-24 flex flex-col items-center text-center relative overflow-hidden">
            <Handshake className="w-16 h-16 text-blue-600 mb-8" />
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-gray-900 dark:text-white mb-8">A Call for Partnership</h2>
            <p className="text-2xl text-gray-500 dark:text-gray-400 font-medium max-w-3xl mb-12">
              The Dargan Forum represents innovation and collaboration—values that align perfectly with CompCharity’s mission. We are seeking partners who believe in digital inclusion.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                to="/contact"
                className="bg-blue-600 text-white px-12 py-6 rounded-3xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center gap-3 group"
              >
                Become a Partner
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/donate"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 px-12 py-6 rounded-3xl font-bold text-lg hover:border-blue-600 transition-all"
              >
                Donate Technology
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 italic font-serif">
            "Every device has the power to change a life."
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            Together, we can turn unused devices into opportunities, and opportunity into lasting change.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
