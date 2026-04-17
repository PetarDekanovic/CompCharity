import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "", type: "General Inquiry" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to send message");

      toast.success("Message sent! We'll be in touch soon.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "", type: "General Inquiry" });
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h1 className="text-6xl font-bold tracking-tighter text-gray-900 mb-8">Get in <br /><span className="text-blue-600 italic font-serif">Touch.</span></h1>
            <p className="text-2xl text-gray-500 font-medium leading-relaxed mb-12">Whether you're donating tech or inquiring about our community work, we're here to help.</p>
            <div className="space-y-8">
              <div className="flex items-center gap-6"><div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Mail className="text-blue-600" /></div><div><div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Us</div><div className="font-bold text-gray-900">hello@compcharity.org</div></div></div>
              <div className="flex items-center gap-6"><div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Phone className="text-blue-600" /></div><div><div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Call Us</div><div className="font-bold text-gray-900">+353 (0) 87 123 4567</div></div></div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 space-y-4">
             <input type="text" placeholder="Full Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
             <input type="email" placeholder="Email Address" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
             <textarea placeholder="Your Message" required rows={4} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
             <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
               {loading ? <Loader2 className="animate-spin" /> : "Send Message"}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
