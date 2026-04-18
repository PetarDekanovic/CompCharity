import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, Phone, Sparkles, Loader2, Zap, ArrowRight, Save, X, Plus, Youtube, Image as ImageIcon, FileText as FileTextIcon,
  Edit, Trash2, LayoutDashboard, Package, Users, FileText, MessageSquare, HelpCircle, Star, Search, Filter, ChevronRight, CheckCircle, XCircle, Clock, MoreVertical, Download, Eye
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { summarizeSubmission } from "../services/geminiService";

// --- Helper Functions ---
const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getYouTubeThumbnail = (videoId: string) => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

const apiFetch = async (url: string, options: any = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    (headers as any)["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }
    return response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out`);
    }
    throw err;
  }
};

// --- Admin Components ---

function AdminBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    youtubeUrl: "",
    category: "Technology",
    readTime: "5 min read",
    published: true,
  });

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("new") === "true") {
      setIsEditing(true);
      setCurrentPost(null);
      setFormData({
        title: "", slug: "", content: "", excerpt: "", featuredImage: "", youtubeUrl: "", category: "Technology", readTime: "5 min read", published: true
      });
    }
  }, [location.search]);

  const fetchPosts = async () => {
    try {
      const data = await apiFetch("/api/admin/blog");
      setPosts(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImage = formData.featuredImage;

    if (formData.youtubeUrl) {
      const vidId = getYouTubeId(formData.youtubeUrl);
      if (vidId && !finalImage) {
        finalImage = getYouTubeThumbnail(vidId);
      }
    }

    try {
      if (currentPost) {
        await apiFetch(`/api/admin/blog/${currentPost.id}`, {
          method: "PATCH",
          body: JSON.stringify({ ...formData, featuredImage: finalImage }),
        });
        toast.success("Blog post updated!");
      } else {
        await apiFetch("/api/admin/blog", {
          method: "POST",
          body: JSON.stringify({ ...formData, featuredImage: finalImage }),
        });
        toast.success("Blog post created!");
      }
      setIsEditing(false);
      setCurrentPost(null);
      fetchPosts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await apiFetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      toast.success("Post deleted");
      fetchPosts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startEdit = (post: any) => {
    setCurrentPost(post);
    setFormData({
      title: post.title || "",
      slug: post.slug || "",
      content: post.content || "",
      excerpt: post.excerpt || "",
      featuredImage: post.featuredImage || "",
      youtubeUrl: post.youtubeUrl || "",
      category: post.category || "Technology",
      readTime: post.readTime || "5 min read",
      published: post.published ?? true,
    });
    setIsEditing(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900">Blog Management</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            Create New Post
          </button>
        )}
      </div>

      {isEditing ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100"
        >
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Slug (Optional)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-if-empty"
                  className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">YouTube URL (Optional)</label>
                <input
                  type="text"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Featured Image URL</label>
                <input
                  type="text"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  placeholder="Leave empty to use YouTube thumbnail if URL provided"
                  className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option>Technology</option>
                  <option>Community</option>
                  <option>Sustainability</option>
                  <option>Impact</option>
                  <option>News</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Read Time</label>
                <input
                  type="text"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Excerpt</label>
              <textarea
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Content (Markdown)</label>
              <textarea
                rows={10}
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => { setIsEditing(false); setCurrentPost(null); }}
                className="px-8 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                {currentPost ? "Update Post" : "Publish Post"}
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden group flex flex-col">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={post.featuredImage || "https://picsum.photos/seed/tech/800/600"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
                {post.youtubeUrl && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-xl shadow-lg">
                    <Zap className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">
                    {post.category || "General"}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(post)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-grow">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </div>
                  <Link to={`/blog/${post.slug}`} className="text-blue-600 font-bold text-sm flex items-center gap-2 group/link">
                    View <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminSidebar() {
  const location = useLocation();
  const menuItems = [
    { name: "Overview", path: "/admin", icon: LayoutDashboard },
    { name: "Submissions", path: "/admin/submissions", icon: Package },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Blog Posts", path: "/admin/blog", icon: FileText },
    { name: "Enquiries", path: "/admin/enquiries", icon: MessageSquare },
    { name: "FAQ", path: "/admin/faq", icon: HelpCircle },
    { name: "Testimonials", path: "/admin/testimonials", icon: Star },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-900 h-screen sticky top-0 flex flex-col p-6 transition-colors">
      <div className="mb-10 px-2">
        <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Admin Panel</h2>
        <div className="text-xl font-extrabold text-gray-900 dark:text-white">
          Comp<span className="text-blue-600">Charity</span>
        </div>
      </div>
      <nav className="space-y-2 flex-grow">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
        
        <div className="pt-6 mt-6 border-t border-gray-50">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">Quick Actions</div>
          <Link
            to="/admin/blog?new=true"
            className="flex items-center gap-3 px-4 py-4 rounded-3xl bg-blue-50 text-blue-600 text-sm font-bold hover:bg-blue-100 transition-all border border-blue-100"
          >
            <Plus className="w-4 h-4" />
            Write Blog Post
          </Link>
        </div>
      </nav>
      <div className="pt-6 border-t border-gray-50">
        <Link to="/" className="text-xs font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest flex items-center gap-2">
          Back to Site <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

function AdminSubmissions({ submissions, refreshSubmissions, formatDate }: { submissions: any[], refreshSubmissions: () => void, formatDate: (t: any) => string }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ listingTitle: "", estimatedPrice: 0 });

  const updateStatus = async (id: string, status: string) => {
    const note = prompt("Add a note for the user (optional):");
    try {
      await apiFetch(`/api/admin/submissions/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      });
      toast.success(`Status updated to ${status}`);
      refreshSubmissions();
      if (selectedSub?.id === id) {
        setSelectedSub((prev: any) => ({ ...prev, status }));
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(`/api/admin/submissions/${selectedSub.id}/details`, {
        method: "PATCH",
        body: JSON.stringify(editForm),
      });
      toast.success("Listing details updated!");
      setEditMode(false);
      refreshSubmissions();
      setSelectedSub((prev: any) => ({ ...prev, ...editForm }));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startEdit = () => {
    setEditForm({
      listingTitle: selectedSub.listingTitle || "",
      estimatedPrice: selectedSub.estimatedPrice || 0,
    });
    setEditMode(true);
  };

  const handleSummarize = async (submission: any) => {
    setSummarizingId(submission.id);
    try {
      const summary = await summarizeSubmission(submission);
      if (summary) {
        await apiFetch(`/api/admin/submissions/${submission.id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ 
            status: submission.status, 
            note: `[AI Summary]: ${summary}` 
          }),
        });
        toast.success("AI Summary generated and added to internal notes!");
        refreshSubmissions();
      }
    } catch (error) {
      console.error("Summary Error:", error);
      toast.error("Failed to generate AI summary.");
    } finally {
      setSummarizingId(null);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = (sub.fullName?.toLowerCase() || "").includes(search.toLowerCase()) || 
                          (sub.referenceNumber?.toLowerCase() || "").includes(search.toLowerCase()) ||
                          (sub.brand?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || sub.status?.toUpperCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const headers = ["Ref", "Name", "Email", "Type", "Category", "Brand", "Model", "Status", "Date"];
    const rows = filteredSubmissions.map(s => [
      s.referenceNumber, s.fullName, s.email, s.type, s.category, s.brand, s.model, s.status, formatDate(s.createdAt)
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `submissions_${format(new Date(), "yyyyMMdd")}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900">Device Submissions</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, reference, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reference</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Device</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredSubmissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{sub.referenceNumber}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {sub.images && sub.images[0] && <img src={sub.images[0]} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{sub.brand} {sub.model}</div>
                      <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{sub.category} • {sub.type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm font-medium text-gray-700">{sub.fullName}</div>
                  <div className="text-xs text-gray-400">{sub.email}</div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    sub.status?.toUpperCase() === "APPROVED" ? "bg-green-100 text-green-700" : 
                    sub.status?.toUpperCase() === "REJECTED" ? "bg-red-100 text-red-700" : 
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-xs text-gray-500">
                  {formatDate(sub.createdAt)}
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleSummarize(sub)} 
                      disabled={summarizingId === sub.id}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl disabled:opacity-50" 
                      title="Generate AI Summary"
                    >
                      {summarizingId === sub.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </button>
                    <button onClick={() => updateStatus(sub.id, "APPROVED")} className="p-2 text-green-600 hover:bg-green-50 rounded-xl" title="Approve">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => updateStatus(sub.id, "REJECTED")} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Reject">
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => setSelectedSub(sub)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {selectedSub && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedSub(null); setEditMode(false); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-bold tracking-tighter text-gray-900">{selectedSub.listingTitle || `${selectedSub.brand} ${selectedSub.model}`}</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Ref: {selectedSub.referenceNumber} • {selectedSub.type}</p>
                </div>
                <button 
                  onClick={() => { setSelectedSub(null); setEditMode(false); }}
                  className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all border border-gray-100 shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-12 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    {/* Device Specs */}
                    <div className="bg-gray-50 rounded-3xl p-8 space-y-6">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Device Specifications</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Category</p>
                          <p className="text-sm font-bold text-gray-900">{selectedSub.category}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Condition</p>
                          <p className="text-sm font-bold text-gray-900">{selectedSub.condition}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estimated Age</p>
                          <p className="text-sm font-bold text-gray-900">{selectedSub.estimatedAge}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">County</p>
                          <p className="text-sm font-bold text-gray-900">{selectedSub.location}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">User Description</h3>
                      <div className="p-6 bg-white border border-gray-100 rounded-3xl text-sm text-gray-600 leading-relaxed font-medium">
                        {selectedSub.description}
                      </div>
                    </div>

                    {/* Images */}
                    {selectedSub.images && selectedSub.images.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Photos ({selectedSub.images.length})</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {selectedSub.images.map((img: string, i: number) => (
                            <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:scale-105 transition-transform">
                              <img src={img} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-8">
                    {/* Marketplace Control */}
                    {selectedSub.type === 'RESALE' && (
                      <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100 space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Marketplace Listing</h3>
                          {!editMode && (
                            <button 
                              onClick={startEdit}
                              className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                            >
                              <Edit className="w-3 h-3" /> Edit
                            </button>
                          )}
                        </div>

                        {editMode ? (
                          <form onSubmit={handleUpdateDetails} className="space-y-6">
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Public Listing Title</label>
                              <input 
                                required
                                value={editForm.listingTitle}
                                onChange={(e) => setEditForm({...editForm, listingTitle: e.target.value})}
                                className="w-full px-5 py-3 rounded-xl border border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Resale Price (€)</label>
                              <input 
                                required
                                type="number"
                                value={editForm.estimatedPrice}
                                onChange={(e) => setEditForm({...editForm, estimatedPrice: parseFloat(e.target.value)})}
                                className="w-full px-5 py-3 rounded-xl border border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                              />
                            </div>
                            <div className="flex gap-3">
                              <button 
                                type="button"
                                onClick={() => setEditMode(false)}
                                className="flex-1 px-4 py-3 rounded-xl bg-white text-gray-500 font-bold text-xs"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit"
                                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-100"
                              >
                                Save Changes
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-6">
                            <div>
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Current Listing Title</p>
                               <p className="text-lg font-bold text-gray-900">{selectedSub.listingTitle || "Not set. Using Brand Model."}</p>
                            </div>
                            <div>
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Market Price</p>
                               <p className="text-3xl font-extrabold text-blue-600">€{selectedSub.estimatedPrice || '0'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="bg-gray-50 rounded-3xl p-8 space-y-6">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">User Contact</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-bold">{selectedSub.fullName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{selectedSub.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{selectedSub.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="space-y-4 pt-6">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Take Action</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedSub.status !== 'APPROVED' && (
                          <button 
                            onClick={() => updateStatus(selectedSub.id, "APPROVED")}
                            className="bg-green-600 text-white p-5 rounded-3xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-green-700 transition-all shadow-xl shadow-green-100"
                          >
                            <CheckCircle className="w-5 h-5" /> Approve Listing
                          </button>
                        )}
                        {selectedSub.status !== 'REJECTED' && (
                          <button 
                            onClick={() => updateStatus(selectedSub.id, "REJECTED")}
                            className="bg-red-50 text-red-600 p-5 rounded-3xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-red-100 transition-all"
                          >
                            <XCircle className="w-5 h-5" /> Reject
                          </button>
                        )}
                        {selectedSub.status !== 'COMPLETED' && (
                          <button 
                            onClick={() => updateStatus(selectedSub.id, "COMPLETED")}
                            className="bg-gray-900 text-white p-5 rounded-3xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-black transition-all col-span-2"
                          >
                            <Sparkles className="w-5 h-5" /> Mark as Sold/Completed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminOverview({ submissions, stats, formatDate }: { submissions: any[], stats: any, formatDate: (t: any) => string }) {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Total Submissions", value: stats.submissions.toString(), icon: Package, color: "blue" },
          { label: "Active Users", value: stats.users.toString(), icon: Users, color: "purple" },
          { label: "Blog Posts", value: stats.blogPosts.toString(), icon: FileText, color: "orange" },
          { label: "New Enquiries", value: stats.enquiries.toString(), icon: MessageSquare, color: "green" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-6">
            <div className={`p-4 bg-${stat.color}-100 rounded-2xl`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-900">{stat.value}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-8">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/admin/blog?new=true"
                className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex flex-col items-center gap-4 hover:bg-blue-100 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-bold text-blue-600">Write Blog Post</span>
              </Link>
              <Link 
                to="/admin/submissions"
                className="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-4 hover:bg-gray-100 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6 text-gray-600" />
                </div>
                <span className="text-sm font-bold text-gray-600">Review Submissions</span>
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-8">Recent Activity</h3>
            <div className="space-y-6">
            {submissions.slice(0, 5).map((sub, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                <div>
                  <p className="text-sm text-gray-700 font-medium">New submission for <span className="font-bold">{sub.brand} {sub.model}</span> from {sub.fullName}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(sub.createdAt)}</p>
                </div>
              </div>
            ))}
            {submissions.length === 0 && (
              <p className="text-sm text-gray-400">No recent activity</p>
            )}
          </div>
        </div>
      </div>
      <div className="bg-gray-900 p-8 rounded-[40px] text-white">
          <h3 className="text-lg font-bold mb-8">System Health</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Database Status</span>
              <span className="text-xs font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Storage Usage</span>
              <span className="text-xs font-bold text-gray-200">1.2 GB / 10 GB</span>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-[12%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchEnquiries = async () => {
    try {
      const data = await apiFetch("/api/admin/enquiries");
      setEnquiries(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/api/admin/enquiries/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`Enquiry marked as ${status}`);
      fetchEnquiries();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredEnquiries = enquiries.filter((enq) => {
    return filter === "ALL" || enq.status === filter;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "MMM d, yyyy HH:mm");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900">Contact Enquiries</h1>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 outline-none shadow-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="READ">Read</option>
            <option value="REPLIED">Replied</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredEnquiries.map((enq) => (
          <div key={enq.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:border-blue-100 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${enq.status === 'NEW' ? 'bg-blue-600 animate-pulse' : 'bg-gray-200'}`} />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{enq.subject}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{enq.type} • {formatDate(enq.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {enq.status !== 'READ' && (
                  <button onClick={() => updateStatus(enq.id, 'READ')} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl" title="Mark as Read">
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                {enq.status !== 'REPLIED' && (
                  <button onClick={() => updateStatus(enq.id, 'REPLIED')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl" title="Mark as Replied">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {enq.status !== 'ARCHIVED' && (
                  <button onClick={() => updateStatus(enq.id, 'ARCHIVED')} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl" title="Archive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="font-bold">{enq.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{enq.email}</span>
                </div>
                {enq.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{enq.phone}</span>
                  </div>
                )}
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl text-gray-700 leading-relaxed">
                {enq.message}
              </div>
            </div>
          </div>
        ))}
        {filteredEnquiries.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
            <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No enquiries found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await apiFetch("/api/admin/users");
      setUsers(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <Loader2 className="w-8 h-8 animate-spin mx-auto mt-12" />;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-gray-900">User Management</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100 text-left">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {user.name?.[0] || user.email?.[0]}
                    </div>
                    <span className="font-medium text-gray-900">{user.name || "Anonymous"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {format(new Date(user.createdAt), "MMM d, yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminFAQ() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<any>(null);
  const [formData, setFormData] = useState({ question: "", answer: "", order: 0 });

  const fetchFaqs = async () => {
    try {
      const data = await apiFetch("/api/admin/faq");
      setFaqs(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentFaq) {
        await apiFetch(`/api/admin/faq/${currentFaq.id}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
        toast.success("FAQ updated!");
      } else {
        await apiFetch("/api/admin/faq", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast.success("FAQ created!");
      }
      setIsEditing(false);
      setCurrentFaq(null);
      setFormData({ question: "", answer: "", order: 0 });
      fetchFaqs();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await apiFetch(`/api/admin/faq/${id}`, { method: "DELETE" });
      toast.success("FAQ deleted");
      fetchFaqs();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <Loader2 className="w-8 h-8 animate-spin mx-auto mt-12" />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900">FAQ Management</h1>
        <button onClick={() => { setIsEditing(true); setCurrentFaq(null); setFormData({ question: "", answer: "", order: faqs.length }); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <input type="text" required value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
              <textarea required rows={4} value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Save FAQ</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
            <div className="flex-grow">
              <h3 className="font-bold text-gray-900">{faq.question}</h3>
              <p className="text-gray-600 mt-1">{faq.answer}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <button onClick={() => { setCurrentFaq(faq); setFormData({ question: faq.question, answer: faq.answer, order: faq.order }); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(faq.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", role: "", content: "", rating: 5, image: "" });

  const fetchTestimonials = async () => {
    try {
      const data = await apiFetch("/api/admin/testimonials");
      setTestimonials(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentTestimonial) {
        await apiFetch(`/api/admin/testimonials/${currentTestimonial.id}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
        toast.success("Testimonial updated!");
      } else {
        await apiFetch("/api/admin/testimonials", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast.success("Testimonial created!");
      }
      setIsEditing(false);
      setCurrentTestimonial(null);
      setFormData({ name: "", role: "", content: "", rating: 5, image: "" });
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await apiFetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      toast.success("Testimonial deleted");
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <Loader2 className="w-8 h-8 animate-spin mx-auto mt-12" />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900">Testimonials Management</h1>
        <button onClick={() => { setIsEditing(true); setCurrentTestimonial(null); setFormData({ name: "", role: "", content: "", rating: 5, image: "" }); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input type="text" required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea required rows={3} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                <input type="number" min="1" max="5" required value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Save Testimonial</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                  {t.image ? <img src={t.image} alt={t.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><Users className="w-6 h-6" /></div>}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{t.name}</h3>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"{t.content}"</p>
              <div className="flex gap-1 mt-3">
                {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setCurrentTestimonial(t); setFormData({ name: t.name, role: t.role, content: t.content, rating: t.rating, image: t.image || "" }); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(t.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main Admin Page ---

export default function Admin() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    submissions: 0,
    users: 0,
    blogPosts: 0,
    enquiries: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Admin: No token found, setting loading to false.");
      setLoading(false);
      return;
    }

    try {
      const [subs, users, posts, enqs] = await Promise.all([
        apiFetch("/api/admin/submissions"),
        apiFetch("/api/admin/users"),
        apiFetch("/api/admin/blog"),
        apiFetch("/api/admin/enquiries"),
      ]);
      setSubmissions(subs);
      setStats({
        submissions: subs.length,
        users: users.length,
        blogPosts: posts.length,
        enquiries: enqs.length,
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString: any) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-grow p-12">
        <Routes>
          <Route path="/" element={<AdminOverview submissions={submissions} stats={stats} formatDate={formatDate} />} />
          <Route path="/submissions" element={<AdminSubmissions submissions={submissions} refreshSubmissions={fetchData} formatDate={formatDate} />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/blog" element={<AdminBlog />} />
          <Route path="/enquiries" element={<AdminEnquiries />} />
          <Route path="/faq" element={<AdminFAQ />} />
          <Route path="/testimonials" element={<AdminTestimonials />} />
        </Routes>
      </div>
    </div>
  );
}
