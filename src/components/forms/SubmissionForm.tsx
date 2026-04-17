import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, Camera, Info, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Props { type: "DONATION" | "RESALE"; }

export const SubmissionForm = ({ type }: Props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ brand: "", model: "", category: "Laptop", condition: "Working", description: "" });
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in first");

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, type }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      toast.success("Submission successful!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Brand</label>
          <input required type="text" placeholder="Apple, Dell, HP..." value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none mt-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Model</label>
          <input required type="text" placeholder="MacBook Pro, Latitude..." value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none mt-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
        </div>
      </div>
      
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Device Description</label>
        <textarea required rows={4} placeholder="Specs, condition details, etc." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none mt-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
        {loading ? <Loader2 className="animate-spin" /> : `Submit ${type === 'DONATION' ? 'Donation' : 'Quote Request'}`}
        {!loading && <ArrowRight className="w-5 h-5" />}
      </button>
    </form>
  );
};
