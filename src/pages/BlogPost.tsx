import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Clock, Bookmark, MessageCircle, Sparkles, Loader2, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { db, collection, query, where, getDocs, doc, updateDoc, handleFirestoreError, OperationType } from "../lib/firebase";
import { generateBlogKeyTakeaways, generateSpeech } from "../services/geminiService";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string;
  featuredImage?: string;
  youtubeVideoId?: string;
  createdAt: any;
  category: any;
  author: any;
  keyTakeaways?: string[];
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingTakeaways, setIsGeneratingTakeaways] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleListen = async () => {
    if (!post) return;
    
    if (isSpeaking) {
      audioRef.current?.pause();
      setIsSpeaking(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.play();
      setIsSpeaking(true);
      return;
    }

    setIsGeneratingAudio(true);
    try {
      // Summarize for TTS to keep it concise
      const textToSpeak = `Title: ${post.title}. This article is about ${post.category?.name || "technology"}. ${post.content.substring(0, 500)}... Read more on CompCharity dot org.`;
      const base64Audio = await generateSpeech(textToSpeak);
      
      if (base64Audio) {
        const binary = atob(base64Audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "audio/mp3" });
        const url = URL.createObjectURL(blob);
        
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.play();
        setIsSpeaking(true);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      toast.error("Failed to generate audio.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const q = query(collection(db, "blogPosts"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setPost({ id: doc.id, ...doc.data() } as Post);
        } else {
          setPost(null);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `blogPosts/${slug}`);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const handleGenerateTakeaways = async () => {
    if (!post) return;
    setIsGeneratingTakeaways(true);
    try {
      const takeaways = await generateBlogKeyTakeaways(`Title: ${post.title}\n\nContent: ${post.content}`);
      if (takeaways && takeaways.length > 0) {
        const postRef = doc(db, "blogPosts", post.id);
        await updateDoc(postRef, { keyTakeaways: takeaways });
        setPost({ ...post, keyTakeaways: takeaways });
      }
    } catch (error) {
      console.error("Takeaways Error:", error);
    } finally {
      setIsGeneratingTakeaways(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "MMMM d, yyyy");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Loading Article</div>
      </div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tighter">Article Not Found</h1>
        <Link to="/blog" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Back to Blog</Link>
      </div>
    </div>
  );

  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-300">
      {/* Hero Header */}
      <header className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Link to="/blog" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest mb-12 hover:gap-4 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-8 border border-blue-100 dark:border-blue-800">
              <span>{post.category?.name || "Insights"}</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-gray-900 dark:text-white leading-[0.85] mb-12">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <User className="w-5 h-5" />
                </div>
                <span>By {typeof post.author === 'string' ? post.author : (post.author?.name || "CompCharity Team")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>8 Min Read</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Featured Image or Video */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="aspect-video rounded-[64px] overflow-hidden shadow-2xl shadow-gray-200 dark:shadow-none border border-gray-100 dark:border-gray-800 bg-black"
        >
          {post.youtubeVideoId ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${post.youtubeVideoId}?autoplay=0&rel=0`}
              title={post.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img
              src={post.image || post.featuredImage || `https://picsum.photos/seed/${post.slug}/1920/1080`}
              alt={post.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
        </motion.div>
      </section>

      {/* Content Section */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            
            {/* Left Sidebar - Share/Meta */}
            <div className="lg:col-span-2 hidden lg:block">
              <div className="sticky top-32 space-y-12">
                <div className="space-y-6">
                  <div className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">Share</div>
                  <div className="flex flex-col gap-4">
                    <button className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                      <Facebook className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-blue-400 hover:text-white transition-all shadow-sm">
                      <Twitter className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-blue-700 hover:text-white transition-all shadow-sm">
                      <Linkedin className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">Actions</div>
                  <div className="flex flex-col gap-4">
                    <button className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-900 dark:hover:bg-white dark:hover:text-black hover:text-white transition-all shadow-sm">
                      <Bookmark className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleListen}
                      disabled={isGeneratingAudio}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                        isSpeaking 
                          ? "bg-blue-600 text-white" 
                          : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                    >
                      {isGeneratingAudio ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isSpeaking ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Article Content */}
            <div className="lg:col-span-7">
              {/* AI Key Takeaways */}
              <AnimatePresence>
                {(post.keyTakeaways && post.keyTakeaways.length > 0) ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 p-10 bg-blue-50 dark:bg-blue-900/20 rounded-[48px] border border-blue-100 dark:border-blue-800/50 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8">
                      <Sparkles className="w-6 h-6 text-blue-200 dark:text-blue-800/30" />
                    </div>
                    <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> AI Key Takeaways
                    </h3>
                    <ul className="space-y-4">
                      {post.keyTakeaways.map((point, i) => (
                        <li key={i} className="flex gap-4 text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                          <span className="text-blue-400 dark:text-blue-500 font-bold">0{i + 1}</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-16 p-10 bg-gray-50 dark:bg-gray-900/50 rounded-[48px] border border-dashed border-gray-200 dark:border-gray-800 text-center"
                  >
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mb-6">Want a quick summary of this article?</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGenerateTakeaways}
                      disabled={isGeneratingTakeaways}
                      className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-8 py-4 rounded-2xl text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                    >
                      {isGeneratingTakeaways ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      Generate AI Takeaways
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <article className="prose prose-2xl prose-blue dark:prose-invert max-w-none">
                <div className="markdown-body text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
              </article>

              <div className="mt-24 pt-12 border-t border-gray-100 dark:border-gray-800">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-[48px] p-12 flex flex-col md:flex-row items-center gap-12">
                  <div className="w-24 h-24 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-xl shadow-blue-200 dark:shadow-none flex-shrink-0">
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">About the Author</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{typeof post.author === 'string' ? post.author : (post.author?.name || "CompCharity Team")}</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                      A dedicated advocate for digital inclusion and sustainable technology. Leading the editorial voice of CompCharity to inspire change.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Related/CTA */}
            <div className="lg:col-span-3">
              <div className="sticky top-32 space-y-12">
                <div className="bg-gray-900 dark:bg-gray-950 rounded-[48px] p-10 text-white relative overflow-hidden border border-transparent dark:border-gray-800">
                  <div className="absolute top-0 right-0 w-full h-full bg-blue-600/10 blur-[80px] -z-0" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold tracking-tighter mb-6">Make an <br /><span className="text-blue-500 italic font-serif">Impact.</span></h3>
                    <p className="text-white/40 text-sm font-medium mb-8 leading-relaxed">
                      Your unused technology could be the key to someone's digital future.
                    </p>
                    <Link
                      to="/donate"
                      className="block w-full text-center bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/40"
                    >
                      Donate Now
                    </Link>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">Newsletter</div>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Get the latest insights on digital inclusion directly to your inbox.</p>
                    <div className="relative">
                      <input 
                        type="email" 
                        placeholder="Your email"
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent rounded-2xl text-sm font-medium focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                      />
                      <button className="absolute right-2 top-2 bottom-2 bg-gray-900 dark:bg-blue-600 text-white px-4 rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 transition-all">
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPost;
