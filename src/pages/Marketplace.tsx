import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Monitor, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Tag,
  Loader2,
  X
} from "lucide-react";

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
  images: { url: string }[];
  createdAt: string;
}

const Marketplace = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Laptop", "Smartphone", "Tablet", "Monitor", "Desktop", "Other"];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/marketplace");
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch marketplace items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === "All" || item.category === filter;
    const matchesSearch = item.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gray-900 text-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 blur-[150px] -z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 border border-blue-500/20">
              <ShoppingBag className="w-4 h-4" />
              <span>CompCharity Market</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Buy Refurbished. <br />
              <span className="italic font-serif text-blue-400 text-7xl md:text-8xl">Support Charity.</span>
            </h1>
            <p className="text-xl text-gray-400 font-medium leading-relaxed mb-12">
              Every device in our market is data-wiped, tested, and certified. 100% of proceeds go directly to our digital inclusion programs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="sticky top-20 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                    filter === cat 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none" 
                      : "bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-[400px]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Market...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="group"
                  >
                    <div className="bg-white dark:bg-gray-900 rounded-[40px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none transition-all hover:shadow-2xl hover:border-blue-500 group-hover:-translate-y-2 h-full flex flex-col">
                      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {item.images && item.images[0] ? (
                          <img 
                            src={item.images[0].url} 
                            alt={`${item.brand} ${item.model}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Laptop className="w-16 h-16 text-gray-300 dark:text-gray-700" />
                          </div>
                        )}
                        <div className="absolute top-6 left-6">
                          <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-8 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                              {item.listingTitle || `${item.brand} ${item.model}`}
                            </h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                               {item.brand} • {item.model}
                            </p>
                          </div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 ml-4">
                            €{item.estimatedPrice}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6 pt-4 border-t border-gray-50 dark:border-gray-800">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            <Smartphone className="w-3 h-3" />
                            {item.condition}
                          </div>
                          <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            <ShieldCheck className="w-3 h-3" />
                            Certified
                          </div>
                        </div>

                        <Link
                          to={`/marketplace/${item.id}`}
                          className="mt-auto w-full bg-gray-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-blue-600 dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group/btn"
                        >
                          View Details <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-40">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No devices found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Try adjusting your filters or search query to find what you're looking for.</p>
              <button 
                onClick={() => {setFilter("All"); setSearchQuery("");}}
                className="mt-8 text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: ShieldCheck, title: "Secure Payouts", desc: "100% secure payment processing with buyer protection." },
              { icon: Tag, title: "Fair Pricing", desc: "Prices based on market value with a charitable focus." },
              { icon: TrendingUp, title: "Zero Waste", desc: "Every purchase extends the lifecycle of high-quality tech." }
            ].map((feature, i) => (
              <div key={i} className="flex gap-6">
                <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Marketplace;
