import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, Phone, Sparkles, Loader2, Zap, ArrowRight, Save, X, Plus, Youtube, Image as ImageIcon, FileText as FileTextIcon,
  Edit, Trash2, LayoutDashboard, Package, Users, FileText, MessageSquare, HelpCircle, Star, Search, Filter, ChevronRight, CheckCircle, XCircle, Clock, MoreVertical, Download, Eye
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { db, collection, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc, arrayUnion, handleFirestoreError, OperationType } from "../lib/firebase";
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
    author: "CompCharity Team",
    category: "Technology",
    image: "",
    youtubeUrl: "",
    readTime: "5 min read"
  });

  useEffect(() => {
    const q = query(collection(db, "blogPosts"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(docs.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "blogPosts");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let youtubeVideoId = "";
    let finalImage = formData.image;

    if (formData.youtubeUrl) {
      const vidId = getYouTubeId(formData.youtubeUrl);
      if (vidId) {
        youtubeVideoId = vidId;
        // If no image is provided, use YouTube thumbnail
        if (!finalImage) {
          finalImage = getYouTubeThumbnail(vidId);
        }
      }
    }

    const postData = {
      ...formData,
      image: finalImage,
      youtubeVideoId,
      slug: formData.slug || formData.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
      date: format(new Date(), "MMMM d, yyyy"),
      updatedAt: new Date()
    };

    try {
      if (currentPost) {
        await updateDoc(doc(db, "blogPosts", currentPost.id), postData);
        toast.success("Blog post updated!");
      } else {
        await addDoc(collection(db, "blogPosts"), {
          ...postData,
          createdAt: new Date()
        });
        toast.success("Blog post created!");
      }
      setIsEditing(false);
      setCurrentPost(null);
      setFormData({
        title: "", slug: "", content: "", excerpt: "", author: "CompCharity Team",
        category: "Technology", image: "", youtubeUrl: "", readTime: "5 min read"
      });
    } catch (error) {
      handleFirestoreError(error, currentPost ? OperationType.UPDATE : OperationType.WRITE, "blogPosts");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "blogPosts", id));
      toast.success("Post deleted");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `blogPosts/${id}`);
    }
  };

  const startEdit = (post: any) => {
    setCurrentPost(post);
    setFormData({
      title: post.title || "",
      slug: post.slug || "",
      content: post.content || "",
      excerpt: post.excerpt || "",
      author: post.author || "CompCharity Team",
      category: post.category || "Technology",
      image: post.image || "",
      youtubeUrl: post.youtubeUrl || "",
      readTime: post.readTime || "5 min read"
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
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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
                  src={post.image || "https://picsum.photos/seed/tech/800/600"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
                {post.youtubeVideoId && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-xl shadow-lg">
                    <Zap className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">
                    {post.category}
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
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{post.date}</div>
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
    <div className="w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col p-6">
      <div className="mb-10 px-2">
        <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Admin Panel</h2>
        <div className="text-xl font-extrabold text-gray-900">CompCharity</div>
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
      </nav>
      <div className="pt-6 border-t border-gray-50">
        <Link to="/" className="text-xs font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest flex items-center gap-2">
          Back to Site <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

function AdminSubmissions({ submissions, formatDate }: { submissions: any[], formatDate: (t: any) => string }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    const noteContent = prompt("Add a note for the user (optional):");
    try {
      const submissionRef = doc(db, "submissions", id);
      const updateData: any = { status };
      
      if (noteContent) {
        updateData.notes = arrayUnion({
          content: noteContent,
          createdAt: new Date(),
          isAdminOnly: false,
        });
      }

      await updateDoc(submissionRef, updateData);
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${id}`);
    }
  };

  const handleSummarize = async (submission: any) => {
    setSummarizingId(submission.id);
    try {
      const summary = await summarizeSubmission(submission);
      if (summary) {
        // We could save this to Firestore, but for now just show it in a toast or alert
        // Let's add it to the submission notes in Firestore for future reference
        const submissionRef = doc(db, "submissions", submission.id);
        await updateDoc(submissionRef, {
          notes: arrayUnion({
            content: `[AI Summary]: ${summary}`,
            createdAt: new Date(),
            isAdminOnly: true,
          })
        });
        toast.success("AI Summary generated and added to internal notes!");
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
                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminOverview({ submissions, formatDate }: { submissions: any[], formatDate: (t: any) => string }) {
  const [stats, setStats] = useState({
    submissions: 0,
    users: 0,
    blogPosts: 0,
    enquiries: 0
  });

  useEffect(() => {
    // In a real app, we'd use a cloud function or separate stats collection
    // For now, we'll just listen to the collections
    const unsubUsers = onSnapshot(collection(db, "users"), (s) => {
      setStats(prev => ({ ...prev, users: s.size }));
    });
    const unsubBlog = onSnapshot(collection(db, "blogPosts"), (s) => {
      setStats(prev => ({ ...prev, blogPosts: s.size }));
    });
    // enquiries not implemented yet
    
    return () => {
      unsubUsers();
      unsubBlog();
    };
  }, []);

  useEffect(() => {
    setStats(prev => ({ ...prev, submissions: submissions.length }));
  }, [submissions]);

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

  useEffect(() => {
    const q = query(collection(db, "enquiries"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt descending
      const sortedDocs = docs.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setEnquiries(sortedDocs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "enquiries");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const enquiryRef = doc(db, "enquiries", id);
      await updateDoc(enquiryRef, { status });
      toast.success(`Enquiry marked as ${status}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `enquiries/${id}`);
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

// --- Main Admin Page ---

export default function Admin() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "submissions"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt descending
      const sortedDocs = docs.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setSubmissions(sortedDocs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "submissions");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-grow p-12">
        <Routes>
          <Route path="/" element={<AdminOverview submissions={submissions} formatDate={formatDate} />} />
          <Route path="/submissions" element={<AdminSubmissions submissions={submissions} formatDate={formatDate} />} />
          <Route path="/users" element={<div>Users Management (CRUD)</div>} />
          <Route path="/blog" element={<AdminBlog />} />
          <Route path="/enquiries" element={<AdminEnquiries />} />
          <Route path="/faq" element={<div>FAQ Management</div>} />
          <Route path="/testimonials" element={<div>Testimonials Management</div>} />
        </Routes>
      </div>
    </div>
  );
}
