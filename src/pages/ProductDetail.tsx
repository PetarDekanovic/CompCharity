import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  ShoppingBag, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Share2, 
  MessageSquare,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface MarketplaceItem {
  id: string;
  referenceNumber: string;
  brand: string;
  model: string;
  listingTitle?: string;
  category: string;
  estimatedAge: string;
  condition: string;
  description: string;
  estimatedPrice: number;
  accessories?: string;
  images: { url: string }[];
  location: string;
  createdAt: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/marketplace/${id}`);
        if (!response.ok) throw new Error("Item not found");
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error("Failed to fetch item details:", error);
        toast.error("Product not found");
        navigate("/marketplace");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPurchaseLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setPurchaseLoading(false);
      setShowPurchaseModal(false);
      toast.success("Purchase request sent! The seller/admin will contact you soon.");
      setPurchaseForm({ name: "", email: "", message: "" });
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fetching details...</p>
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] pt-32 pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs / Back button */}
        <Link 
          to="/marketplace" 
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Images Section */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-[64px] overflow-hidden border border-gray-100 dark:border-gray-800 relative shadow-2xl"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  src={item.images[activeImage]?.url}
                  alt={item.model}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              <div className="absolute top-8 left-8">
                <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-xl">
                  {item.category}
                </span>
              </div>
            </motion.div>

            {item.images.length > 1 && (
              <div className="flex gap-4 p-2 overflow-x-auto scrollbar-hide">
                {item.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-24 h-24 rounded-3xl overflow-hidden border-4 transition-all ${
                      activeImage === i ? "border-blue-600 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white mb-2">
                    {item.listingTitle || `${item.brand} ${item.model}`}
                  </h1>
                  <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    {item.brand} {item.model} • Ref: {item.referenceNumber} • {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">€{item.estimatedPrice}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Condition</div>
                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    {item.condition}
                  </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Estimated Age</div>
                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    {item.estimatedAge}
                  </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Location</div>
                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    {item.location}, IE
                  </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Data Security</div>
                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    100% Wiped
                  </div>
                </div>
              </div>

              <div className="space-y-8 mb-12">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Description</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                </div>
                {item.accessories && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Included Accessories</h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{item.accessories}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="flex-1 bg-blue-600 text-white py-6 rounded-3xl font-bold text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-3"
                >
                  Confirm & Buy Now <ShoppingBag className="w-6 h-6" />
                </button>
                <button
                  onClick={() => toast.info("Link to contact support for this product")}
                  className="px-10 py-6 rounded-3xl border-2 border-gray-100 dark:border-gray-800 font-bold text-gray-900 dark:text-white hover:border-blue-600 dark:hover:border-blue-400 transition-all flex items-center justify-center gap-3"
                >
                  Ask Question <MessageSquare className="w-6 h-6" />
                </button>
              </div>

              {/* Purchase Modal */}
              <AnimatePresence>
                {showPurchaseModal && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowPurchaseModal(false)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative w-full max-w-xl bg-white dark:bg-gray-950 rounded-[48px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
                    >
                      <div className="p-12">
                        <div className="flex justify-between items-start mb-12">
                          <div className="space-y-2">
                            <h2 className="text-4xl font-bold tracking-tighter text-gray-900 dark:text-white">Purchase Request</h2>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">You're interested in the {item.brand} {item.model}</p>
                          </div>
                          <button 
                            onClick={() => setShowPurchaseModal(false)}
                            className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>

                        <form onSubmit={handlePurchaseSubmit} className="space-y-6">
                          <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Your Name</label>
                            <input
                              required
                              type="text"
                              value={purchaseForm.name}
                              onChange={(e) => setPurchaseForm({...purchaseForm, name: e.target.value})}
                              className="w-full px-8 py-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
                              placeholder="John Doe"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Email Address</label>
                            <input
                              required
                              type="email"
                              value={purchaseForm.email}
                              onChange={(e) => setPurchaseForm({...purchaseForm, email: e.target.value})}
                              className="w-full px-8 py-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
                              placeholder="john@example.com"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Message (Optional)</label>
                            <textarea
                              value={purchaseForm.message}
                              onChange={(e) => setPurchaseForm({...purchaseForm, message: e.target.value})}
                              rows={4}
                              className="w-full px-8 py-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white resize-none"
                              placeholder="Any questions about delivery or condition?"
                            />
                          </div>

                          <div className="pt-6">
                            <button
                              disabled={purchaseLoading}
                              className="w-full bg-blue-600 text-white py-6 rounded-3xl font-bold text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                              {purchaseLoading ? (
                                <>
                                  <Loader2 className="w-6 h-6 animate-spin" />
                                  Processing Request...
                                </>
                              ) : (
                                <>
                                  Submit Request <ArrowRight className="w-6 h-6" />
                                </>
                              )}
                            </button>
                            <p className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-6">
                              Submiting this request is not a payment. We will contact you to finalize.
                            </p>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              <div className="mt-12 p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[40px] border border-blue-100 dark:border-blue-800 flex items-start gap-6">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                  <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1 tracking-tight">Charitable Impact</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    100% of the proceeds from this sale directly fund digital education for students in underprivileged areas across Ireland. Every purchase changes a life.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
