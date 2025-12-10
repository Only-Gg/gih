import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Heart, Plus, Edit, Trash2, Copy, Calendar, ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard() {
  const [memoryPages, setMemoryPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchMemoryPages();
  }, [navigate]);

  const fetchMemoryPages = async () => {
    try {
      const response = await axios.get(`${API}/memory-pages`);
      setMemoryPages(response.data);
    } catch (error) {
      toast.error("حدث خطأ في تحميل الصفحات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/memory-pages/${deleteId}`);
      toast.success("تم حذف الصفحة بنجاح");
      setMemoryPages(memoryPages.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      toast.error("حدث خطأ في حذف الصفحة");
      console.error(error);
    }
  };

  const copyLink = (pageId) => {
    const link = `${window.location.origin}/view/${pageId}`;
    navigator.clipboard.writeText(link);
    toast.success("تم نسخ الرابط بنجاح");
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F2EB' }}>
        <div className="w-12 h-12 border-4 border-[#4A0404]/30 border-t-[#4A0404] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#F5F2EB' }}>
      <div className="texture-overlay fixed inset-0 pointer-events-none opacity-[0.03] z-0"></div>

      <div className="relative z-10">
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4A0404' }}>
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-serif" style={{ color: '#4A0404' }} data-testid="dashboard-title">
                لوحة التحكم
              </h1>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="font-sans"
              data-testid="logout-button"
            >
              تسجيل الخروج
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif mb-2" style={{ color: '#4A0404' }}>
                صفحات الذكريات
              </h2>
              <p className="text-gray-600 font-sans">إدارة جميع صفحات الذكريات الخاصة بك</p>
            </div>
            <Button
              onClick={() => navigate("/admin/create")}
              className="text-white rounded-full px-6 py-6 font-serif tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ backgroundColor: '#4A0404' }}
              data-testid="create-memory-button"
            >
              <Plus className="w-5 h-5 ml-2" />
              إنشاء صفحة جديدة
            </Button>
          </div>

          {memoryPages.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FCE7E7' }}>
                <Heart className="w-10 h-10" style={{ color: '#4A0404' }} />
              </div>
              <h3 className="text-2xl font-serif mb-2" style={{ color: '#4A0404' }}>
                لا توجد صفحات بعد
              </h3>
              <p className="text-gray-600 font-sans mb-6">ابدأ بإنشاء أول صفحة ذكريات</p>
              <Button
                onClick={() => navigate("/admin/create")}
                className="text-white rounded-full px-8 py-3 font-serif"
                style={{ backgroundColor: '#4A0404' }}
                data-testid="create-first-memory-button"
              >
                <Plus className="w-5 h-5 ml-2" />
                إنشاء الآن
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="memory-pages-grid">
              {memoryPages.map((page) => (
                <div
                  key={page.id}
                  className="bg-white/80 backdrop-blur-sm border border-white/40 shadow-lg rounded-xl p-6 memory-card-hover"
                  data-testid={`memory-card-${page.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-serif flex-1" style={{ color: '#4A0404' }} data-testid={`memory-title-${page.id}`}>
                      {page.title}
                    </h3>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="font-sans">
                        {new Date(page.created_at).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Heart className="w-4 h-4" />
                      <span className="font-sans">{page.memories.length} ذكرى</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyLink(page.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 font-sans"
                      data-testid={`copy-link-button-${page.id}`}
                    >
                      <Copy className="w-4 h-4 ml-1" />
                      نسخ الرابط
                    </Button>
                    <Button
                      onClick={() => navigate(`/admin/edit/${page.id}`)}
                      variant="outline"
                      size="sm"
                      className="font-sans"
                      data-testid={`edit-button-${page.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setDeleteId(page.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      data-testid={`delete-button-${page.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-right">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="font-sans text-right">
              هل أنت متأكد من حذف هذه الصفحة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel className="font-sans" data-testid="cancel-delete-button">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-sans"
              data-testid="confirm-delete-button"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}