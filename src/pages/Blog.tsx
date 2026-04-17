import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Search, Calendar, Clock, ArrowRight, Zap, Filter, MessageSquare, Newspaper, Info } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/blog");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch blog posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const categories = ["All", "Technology", "Community", "Sustainability", "Impact", "News"];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-6xl font-bold tracking-tighter text-gray-900 mb-8">Digital <span className="text-blue-600 italic font-serif">Insights.</span></h1>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat ? "bg-blue-600 text-white shadow-lg" : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
              <div className="aspect-video relative overflow-hidden">
                <img src={post.featuredImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
              </div>
              <div className="p-8">
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">{post.category}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-6">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{format(new Date(post.createdAt), "MMM d, yyyy")}</span>
                   <span className="text-blue-600 font-bold text-sm flex items-center gap-2">Read More <ArrowRight className="w-4 h-4" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
