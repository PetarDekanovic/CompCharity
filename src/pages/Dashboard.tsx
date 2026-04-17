import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Laptop, Clock, CheckCircle, Package, Calendar, Tag, Info, Activity, ShieldCheck, Search, MessageCircle, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/submissions/my", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        setSubmissions(data);
        if (data.length > 0) setSelectedSubmission(data[0]);
      } catch (error) {
        toast.error("Failed to load your submissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "REJECTED": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12">
      <main className="max-w-[1600px] mx-auto px-8">
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tighter text-gray-900 mb-2">Welcome back, <span className="text-blue-600 italic font-serif">{user?.name?.split(' ')[0]}</span></h1>
          <p className="text-lg text-gray-500 font-medium">Manage your tech lifecycle and track your digital impact.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">Asset Inventory</h2>
            {submissions.map((sub) => (
              <motion.div
                key={sub.id}
                onClick={() => setSelectedSubmission(sub)}
                className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all ${selectedSubmission?.id === sub.id ? "border-blue-500 bg-white shadow-xl" : "border-gray-100 bg-white"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center text-gray-400">
                      {sub.images && sub.images[0] ? <img src={sub.images[0]} className="w-full h-full object-cover" /> : <Laptop />}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{sub.referenceNumber}</div>
                      <h3 className="text-xl font-bold text-gray-900">{sub.brand} {sub.model}</h3>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(sub.status)}`}>{sub.status}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-5">
            {selectedSubmission ? (
              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm sticky top-32">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">{selectedSubmission.brand} {selectedSubmission.model}</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100"><p className="text-sm text-blue-600 font-medium leading-relaxed">Status Updates and internal notes will appear here once our team reviews your submission.</p></div>
                  <a href={`https://wa.me/353871234567?text=Hi, I have a question about my submission ${selectedSubmission.referenceNumber}`} target="_blank" className="w-full flex items-center justify-center gap-3 bg-emerald-500 text-white py-6 rounded-3xl font-bold hover:bg-emerald-600 transition-all">
                    <MessageCircle /> Chat with Support
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-20 text-center bg-gray-100/50 rounded-[48px] border-2 border-dashed border-gray-200"><h3 className="text-xl font-bold text-gray-400">Select an Asset</h3></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
