import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Users, FileText, CheckCircle, XCircle, Clock, Trash2, Shield, Search, Filter } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/admin/submissions", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        setSubmissions(data);
      } catch (error) {
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/admin/submissions/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      setSubmissions(submissions.map(s => s.id === id ? { ...s, status } : s));
      toast.success(`Submission ${status.toLowerCase()}`);
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold tracking-tighter text-gray-900">Admin Control <span className="text-blue-600 italic font-serif">Center</span></h1>
        </div>

        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Asset</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-bold text-gray-900">{sub.brand} {sub.model}</div>
                    <div className="text-xs text-gray-400 font-bold tracking-widest uppercase">{sub.referenceNumber}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium text-gray-600">{sub.user?.name}</div>
                    <div className="text-xs text-gray-400">{sub.user?.email}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100 text-blue-600 bg-blue-50">{sub.status}</span>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button onClick={() => updateStatus(sub.id, "APPROVED")} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"><CheckCircle /></button>
                    <button onClick={() => updateStatus(sub.id, "REJECTED")} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><XCircle /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
