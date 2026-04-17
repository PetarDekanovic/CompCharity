import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Calendar, Clock, ArrowLeft, Share2, MessageSquare, Twitter, Facebook, Linkedin } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog/${slug}`);
        if (!response.ok) throw new Error("Post not found");
        const data = await response.json();
        setPost(data);
      } catch (error) {
        navigate("/blog");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!post) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[60vh] overflow-hidden">
        <img src={post.featuredImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-widest">{post.category}</span>
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-none">{post.title}</h1>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="flex items-center gap-6 mb-12 pb-12 border-b border-gray-100">
           <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{format(new Date(post.createdAt), "MMMM d, yyyy")}</div>
           <div className="w-1 h-1 bg-gray-200 rounded-full" />
           <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">By CompCharity Team</div>
        </div>
        
        <div className="prose prose-lg prose-blue max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="mt-20 pt-12 border-t border-gray-100 flex items-center justify-between">
           <Link to="/blog" className="flex items-center gap-2 text-blue-600 font-bold hover:gap-4 transition-all">
             <ArrowLeft className="w-4 h-4" /> Back to Blog
           </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
