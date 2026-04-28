import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Calendar, User, ArrowRight, Tag, Search, ChevronRight, Sparkles, Newspaper, Zap } from "lucide-react";
import { format } from "date-fns";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image?: string;
  featuredImage?: string;
  videoUrl?: string;
  createdAt: any;
  category: any;
  author: any;
}

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getTikTokId = (url: string) => {
  const regExp = /tiktok\.com\/.*video\/(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

const VideoEmbed = ({ url, title, isFeatured = false }: { url: string; title: string; isFeatured?: boolean }) => {
  const ytId = getYouTubeId(url);
  const ttId = getTikTokId(url);

  if (ytId) {
    return (
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&modestbranding=1&rel=0`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (ttId) {
    return (
      <iframe
        className="w-full h-full"
        src={`https://www.tiktok.com/embed/v2/${ttId}?lang=en-US&autoplay=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return null;
};

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog');
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "MMM d, yyyy");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Loading Insights</div>
      </div>
    </div>
  );

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Editorial Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 border border-blue-100 dark:border-blue-800">
                <Newspaper className="w-4 h-4" />
                <span>The CompCharity Journal</span>
              </div>
              <h1 className="text-7xl md:text-8xl font-bold tracking-tighter text-gray-900 dark:text-white leading-[0.85] mb-12">
                Insights on <br />
                <span className="text-blue-600 dark:text-blue-400 italic font-serif text-8xl md:text-9xl">Digital Inclusion.</span>
              </h1>
              <p className="text-2xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">
                Stay updated with the latest news on tech refurbishment, student support, and social impact in Ireland.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to={`/blog/${featuredPost.slug}`} className="group">
              <motion.div 
                whileHover={{ y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
              >
                <div className="lg:col-span-7">
                  <div className="aspect-[16/9] rounded-[64px] overflow-hidden shadow-2xl shadow-gray-200 dark:shadow-none group-hover:scale-[1.02] transition-transform duration-700 relative bg-black">
                    {featuredPost.videoUrl ? (
                      <VideoEmbed url={featuredPost.videoUrl} title={featuredPost.title} isFeatured />
                    ) : (
                      <img 
                        src={featuredPost.image || featuredPost.featuredImage || `https://picsum.photos/seed/${featuredPost.slug}/1200/800`}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {featuredPost.videoUrl && !featuredPost.videoUrl.includes('autoplay') && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors pointer-events-none">
                        <div className="w-20 h-20 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center shadow-2xl">
                          <Zap className="w-10 h-10 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-5 space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                    {featuredPost.category?.name || featuredPost.category || "Featured Story"}
                  </div>
                  <h2 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-6 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatDate(featuredPost.createdAt)}</span>
                    <span className="flex items-center gap-2"><User className="w-4 h-4" /> {typeof featuredPost.author === 'string' ? featuredPost.author : (featuredPost.author?.name || "CompCharity Team")}</span>
                  </div>
                  <div className="pt-4 flex items-center gap-4 text-blue-600 dark:text-blue-400 font-bold group-hover:gap-6 transition-all">
                    Read Full Story <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </section>
      )}

      {/* Grid Posts */}
      <section className="py-32 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {remainingPosts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Link to={`/blog/${post.slug}`}>
                  <div className="aspect-[4/3] rounded-[48px] overflow-hidden shadow-xl shadow-gray-100 dark:shadow-none mb-8 group-hover:scale-[1.05] transition-transform duration-700 relative bg-black">
                    {post.videoUrl ? (
                      <VideoEmbed url={post.videoUrl} title={post.title} />
                    ) : (
                      <img 
                        src={post.image || post.featuredImage || `https://picsum.photos/seed/${post.slug}/800/600`}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      <span className="text-blue-600 dark:text-blue-400">{post.category?.name || post.category || "News"}</span>
                      <span>•</span>
                      <span>By {typeof post.author === 'string' ? post.author : (post.author?.name || "Team")}</span>
                      <span>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="pt-4 flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:gap-4 transition-all">
                      Read More <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-32 bg-gray-50 dark:bg-gray-900 rounded-[64px] border border-dashed border-gray-200 dark:border-gray-800">
              <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-gray-200 dark:shadow-none">
                <Newspaper className="w-10 h-10 text-gray-300 dark:text-gray-700" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No stories yet</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Check back soon for latest updates.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter - Dark Luxury */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 dark:bg-gray-950 rounded-[64px] p-16 md:p-24 text-center text-white relative overflow-hidden border border-transparent dark:border-gray-800">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[120px] -z-0" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
                <Sparkles className="w-4 h-4" />
                <span>Stay Informed</span>
              </div>
              <h2 className="text-6xl font-bold tracking-tighter mb-8">Join our <span className="text-blue-500 italic font-serif">Newsletter.</span></h2>
              <p className="text-xl text-white/50 font-medium mb-12">Get the latest news on digital inclusion and sustainability delivered straight to your inbox.</p>
              <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-8 py-6 rounded-3xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <button className="bg-blue-600 text-white px-10 py-6 rounded-3xl font-bold hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/40 whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
