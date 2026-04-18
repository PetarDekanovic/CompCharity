import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Laptop, Clock, CheckCircle, XCircle, ChevronRight, Package, Calendar, MapPin, Tag, Info, ArrowRight, Activity, ShieldCheck, Search, Filter, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Submission {
  id: string;
  referenceNumber: string;
  type: string;
  category: string;
  brand: string;
  model: string;
  status: string;
  createdAt: any;
  images: string[];
  notes?: { content: string; createdAt: any; isAdminOnly: boolean }[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    console.log("Dashboard: useEffect running. User:", user);
    if (!user) {
      console.log("Dashboard: No user, setting loading to false.");
      setLoading(false);
      return;
    }

    const fetchSubmissions = async () => {
      console.log("Dashboard: Starting fetchSubmissions...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("Dashboard: Fetch timed out, aborting.");
        controller.abort();
      }, 10000); // 10 second timeout

      try {
        const token = localStorage.getItem("token");
        console.log("Dashboard: Token present:", !!token);
        const response = await fetch("/api/submissions/my", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log("Dashboard: Fetch response status:", response.status);
        if (!response.ok) throw new Error(`Failed to fetch submissions: ${response.status}`);
        
        const data = await response.json();
        console.log("Dashboard: Fetched data length:", data.length);
        setSubmissions(data);
        if (data.length > 0 && !selectedSubmission) {
          setSelectedSubmission(data[0]);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.error("Dashboard Fetch Error: Request timed out");
          toast.error("Loading is taking longer than expected. Please check your connection.");
        } else {
          console.error("Dashboard Fetch Error:", error);
          toast.error("Failed to load your submissions.");
        }
      } finally {
        console.log("Dashboard: Setting loading to false.");
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUBMITTED": 
      case "PENDING": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "APPROVED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "REJECTED": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "COMPLETED": return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default: return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      sub.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === "all" || sub.status?.toLowerCase() === filter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, HH:mm");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] transition-colors duration-300">
      <div className="flex flex-col items-center gap-6">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full shadow-2xl shadow-blue-100 dark:shadow-none" 
        />
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]"
        >
          Initialising Dashboard
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Header Section */}
      <header className="pt-32 pb-12 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                <Activity className="w-3 h-3" />
                <span>Active Session</span>
              </div>
              <h1 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white mb-2">
                Welcome, <span className="text-blue-600 dark:text-blue-400 italic font-serif">{user?.name?.split(' ')[0]}</span>
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Manage your tech lifecycle and track your digital impact.</p>
            </motion.div>

            <div className="flex gap-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 flex items-center gap-6 group cursor-default"
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors duration-500">
                  <Package className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white leading-none mb-1">{submissions.length}</div>
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total Assets</div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -5 }}
                className="bg-gray-900 dark:bg-gray-950 p-6 rounded-[32px] flex items-center gap-6 text-white group cursor-default border border-gray-800 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-400 transition-colors duration-500">
                  <ShieldCheck className="w-6 h-6 text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-3xl font-bold leading-none mb-1">100%</div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Data Secure</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* List Section */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                Asset Inventory
              </h2>
              <div className="flex flex-wrap gap-2">
                {["all", "pending", "approved", "rejected"].map((status) => (
                  <motion.button
                    key={status}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(status as any)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      filter === status
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none"
                        : "bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800"
                    }`}
                  >
                    {status}
                  </motion.button>
                ))}
              </div>
              <div className="relative w-full sm:w-72 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent rounded-2xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-[48px] p-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-gray-200 dark:shadow-none">
                  <Laptop className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No assets found</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-12 max-w-xs mx-auto">Start by donating or reselling your unused technology to see it here.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/donate" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-none">Donate Now</Link>
                  <Link to="/resell" className="bg-gray-900 dark:bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 dark:hover:bg-gray-700 transition-all">Resell Now</Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((sub, i) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.01, x: 5 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedSubmission(sub)}
                    className={`group relative bg-white dark:bg-gray-900/50 p-6 rounded-[32px] border-2 cursor-pointer transition-all duration-500 ${
                      selectedSubmission?.id === sub.id 
                        ? "border-blue-500 shadow-2xl shadow-blue-100/50 dark:shadow-none" 
                        : "border-gray-50 dark:border-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-xl hover:shadow-gray-100 dark:hover:shadow-none"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-700">
                          {sub.images && sub.images[0] ? (
                            <img src={typeof sub.images[0] === 'string' ? sub.images[0] : (sub.images[0] as any).url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Laptop className="w-8 h-8 text-gray-200 dark:text-gray-700" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-1">{sub.referenceNumber}</div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{sub.brand} {sub.model}</h3>
                          <div className="flex flex-wrap items-center gap-4">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                              <Tag className="w-3 h-3" /> {sub.category}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                              <Calendar className="w-3 h-3" /> {formatDate(sub.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                          selectedSubmission?.id === sub.id ? "bg-blue-600 text-white" : "bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 group-hover:text-gray-400 dark:group-hover:text-gray-500"
                        }`}>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <AnimatePresence mode="wait">
                {selectedSubmission ? (
                  <motion.div
                    key={selectedSubmission.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white dark:bg-gray-900/80 rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden"
                  >
                    {/* Detail Header */}
                    <div className="p-10 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-2">Asset Profile</div>
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tighter">{selectedSubmission.brand} {selectedSubmission.model}</h2>
                        </div>
                        <span className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(selectedSubmission.status)}`}>
                          {selectedSubmission.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Submission Type</div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedSubmission.type}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Reference ID</div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedSubmission.referenceNumber}</div>
                        </div>
                      </div>
                    </div>

                    {/* Detail Body */}
                    <div className="p-10 space-y-10">
                      {/* Gallery */}
                      <div className="space-y-4">
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Visual Documentation</div>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                          {selectedSubmission.images?.map((img: any, i) => (
                            <motion.div 
                              key={i} 
                              whileHover={{ scale: 1.05 }}
                              className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border border-gray-100 dark:border-gray-800"
                            >
                              <img src={typeof img === 'string' ? img : img.url} className="w-full h-full object-cover" />
                            </motion.div>
                          ))}
                          {(!selectedSubmission.images || selectedSubmission.images.length === 0) && (
                            <div className="w-full py-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-300 dark:text-gray-700 italic text-sm">
                              No images provided
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timeline/Notes */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Activity Log</div>
                          <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Real-time Updates</div>
                        </div>
                        <div className="space-y-4">
                          {!selectedSubmission.notes || selectedSubmission.notes.filter(n => !n.isAdminOnly).length === 0 ? (
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 text-center">
                              <Info className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium italic">Your submission is currently in the verification queue. We'll post updates here.</p>
                            </div>
                          ) : (
                            selectedSubmission.notes.filter(n => !n.isAdminOnly).map((note, i) => (
                              <div key={i} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-blue-100 dark:before:bg-blue-900/30">
                                <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100/50 dark:border-blue-900/30">
                                  <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{note.content}</p>
                                  <div className="text-[10px] text-blue-400 dark:text-blue-500 mt-3 font-bold uppercase tracking-widest">{formatDateTime(note.createdAt)}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* WhatsApp Support Action */}
                      <div className="px-10 pb-10">
                        <motion.a
                          href={`https://wa.me/353871234567?text=${encodeURIComponent(`Hi CompCharity, I have a question about my submission ${selectedSubmission.referenceNumber} (${selectedSubmission.brand} ${selectedSubmission.model}).`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-3 bg-emerald-500 text-white py-6 rounded-3xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 dark:shadow-none"
                        >
                          <MessageCircle className="w-6 h-6" />
                          <span>Chat with Support on WhatsApp</span>
                        </motion.a>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900/30 rounded-[48px] p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center min-h-[500px]">
                    <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-gray-200 dark:shadow-none">
                      <Info className="w-12 h-12 text-gray-200 dark:text-gray-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Select an Asset</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-[240px] leading-relaxed">Choose a submission from your inventory to view full technical details and lifecycle updates.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
