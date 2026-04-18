import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion } from "motion/react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Loader2, 
  Globe, 
  Building2, 
  Users,
  Sparkles,
  MessageSquare,
  Clock,
  ArrowRight
} from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject is required"),
  message: z.string().min(10, "Message is required"),
  type: z.string().min(1, "Type is required"),
});

type ContactData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      type: "GENERAL",
    },
  });

  const onSubmit = async (data: ContactData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setIsSuccess(true);
      toast.success("Message sent! We'll get back to you soon.");
      reset();
    } catch (error: any) {
      console.error("Contact Error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
                <MessageSquare className="w-4 h-4" />
                <span>Contact Us</span>
              </div>
              <h1 className="text-7xl md:text-8xl font-bold tracking-tighter text-gray-900 dark:text-white leading-[0.85] mb-12">
                Get in <br />
                <span className="text-blue-600 dark:text-blue-400 italic font-serif">Touch.</span>
              </h1>
              <p className="text-2xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xl">
                Have a question about tech donation, resale, or partnership? We're here to help you make an impact.
              </p>

              <div className="mt-12 flex flex-col sm:flex-row gap-6">
                <motion.a
                  href="https://wa.me/353871234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-3 bg-emerald-500 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-100 dark:shadow-none"
                >
                  <MessageSquare className="w-6 h-6" />
                  <span>WhatsApp Us Directly</span>
                </motion.a>
              </div>

                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 dark:shadow-none">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Email Us</h3>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">office@compcharity.org</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-xl shadow-green-200 dark:shadow-none">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">WhatsApp Us</h3>
                      <a 
                        href="https://wa.me/353871234567" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 dark:text-gray-400 font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      >
                        +353 87 123 4567
                      </a>
                    </div>
                  </div>
                </div>
            </motion.div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-[64px] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80" 
                  alt="Contact us"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-xl border border-gray-50 dark:border-gray-800 max-w-xs">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Fast Response</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">Within 24 Hours</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-32 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
            {/* Info Sidebar */}
            <div className="lg:col-span-4 space-y-12">
              <div className="sticky top-32">
                <h2 className="text-4xl font-bold tracking-tighter text-gray-900 dark:text-white mb-12">Our Offices</h2>
                <div className="space-y-12">
                  <div className="p-8 bg-white dark:bg-gray-900 rounded-[40px] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
                      <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Main Hub</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                      Portlaoise Enterprise Centre,<br />
                      Portlaoise, Co. Laois,<br />
                      Ireland
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">Global</div>
                      <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Partnerships</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">Local</div>
                      <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Impact</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Area */}
            <div className="lg:col-span-8">
              <div className="bg-white dark:bg-gray-900 rounded-[64px] p-12 md:p-20 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
                {isSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Send className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-4xl font-bold tracking-tighter text-gray-900 dark:text-white mb-4">Message Sent!</h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400 font-medium mb-12">Thank you for reaching out. Our team will get back to you shortly.</p>
                    <button
                      onClick={() => setIsSuccess(false)}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-2 mx-auto"
                    >
                      Send another message <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Full Name</label>
                        <input
                          {...register("name")}
                          className="w-full px-8 py-6 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all font-medium text-gray-900 dark:text-white"
                          placeholder="John Doe"
                        />
                        {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Email Address</label>
                        <input
                          {...register("email")}
                          className="w-full px-8 py-6 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all font-medium text-gray-900 dark:text-white"
                          placeholder="john@example.com"
                        />
                        {errors.email && <p className="text-xs text-red-500 font-bold">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Phone (Optional)</label>
                        <input
                          {...register("phone")}
                          className="w-full px-8 py-6 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all font-medium text-gray-900 dark:text-white"
                          placeholder="+353 ..."
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Enquiry Type</label>
                        <select
                          {...register("type")}
                          className="w-full px-8 py-6 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all font-medium appearance-none text-gray-900 dark:text-white"
                        >
                          <option value="GENERAL">General Enquiry</option>
                          <option value="PARTNERSHIP">Business Partnership</option>
                          <option value="CORPORATE">Corporate Bulk Donation</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Subject</label>
                      <input
                        {...register("subject")}
                        className="w-full px-8 py-6 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all font-medium text-gray-900 dark:text-white"
                        placeholder="How can we help?"
                      />
                      {errors.subject && <p className="text-xs text-red-500 font-bold">{errors.subject.message}</p>}
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Message</label>
                      <textarea
                        {...register("message")}
                        rows={6}
                        className="w-full px-8 py-6 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all font-medium resize-none text-gray-900 dark:text-white"
                        placeholder="Tell us more about your enquiry..."
                      />
                      {errors.message && <p className="text-xs text-red-500 font-bold">{errors.message.message}</p>}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 text-white py-8 rounded-3xl font-bold text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-4"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <Send className="w-6 h-6" />
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
