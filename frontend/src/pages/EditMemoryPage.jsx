import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Plus, Trash2, Upload, ArrowLeft, Image as ImageIcon, Video, Shuffle } from "lucide-react";

const BACKEND_URL = "https://gih-production.up.railway.app";
const API = `https://gih-production.up.railway.app/api`;

export default function EditMemoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    page_id: "",
    title: "",
    password: "",
    welcome_message: "",
    final_message: "",
  });
  const [memories, setMemories] = useState([]);

  useEffect(() => {
    fetchMemoryPage();
  }, [id]);

  const fetchMemoryPage = async () => {
    try {
      const response = await axios.get(`${API}/memory-pages/${id}`);
      const page = response.data;
      setFormData({
        page_id: page.id, // <-- حفظ الـ id الحالي
        title: page.title,
        password: "",
        welcome_message: page.welcome_message,
        final_message: page.final_message,
      });
      setMemories(page.memories);
    } catch (error) {
      toast.error("حدث خطأ في تحميل البيانات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const code = [...Array(8)]
      .map(() => Math.random().toString(36)[2].toUpperCase())
      .join("");
    setFormData({ ...formData, page_id: code });
  };

  const handleAddMemory = () => {
    setMemories([...memories, { type: "image", url: "", caption: "", order: memories.length }]);
  };

  const handleRemoveMemory = (index) => {
    setMemories(memories.filter((_, i) => i !== index));
  };

  const handleMemoryChange = (index, field, value) => {
    const updated = [...memories];
    updated[index][field] = value;
    setMemories(updated);
  };

  const handleFileUpload = async (index, file) => {
    const formDataFile = new FormData();
    formDataFile.append("file", file);

    try {
      const response = await axios.post(`${API}/upload`, formDataFile, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        const fileType = file.type.startsWith("video") ? "video" : "image";
        handleMemoryChange(index, "type", fileType);
        handleMemoryChange(index, "url", `${BACKEND_URL}${response.data.url}`);
        toast.success("تم رفع الملف بنجاح");
      }
    } catch (error) {
      toast.error("فشل رفع الملف");
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (memories.length === 0) {
      toast.error("يجب إضافة ذكرى واحدة على الأقل");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        id: formData.page_id, // <-- إرسال الـ id الجديد أو الحالي
        title: formData.title,
        welcome_message: formData.welcome_message,
        final_message: formData.final_message,
        memories: memories.map((m, i) => ({ ...m, order: i })),
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await axios.put(`${API}/memory-pages/${id}`, payload);
      toast.success("تم تحديث الصفحة بنجاح");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error("حدث خطأ في تحديث الصفحة");
      console.error(error);
    } finally {
      setSaving(false);
    }
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
          <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
            <Button
              onClick={() => navigate("/admin/dashboard")}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4A0404' }}>
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-serif" style={{ color: '#4A0404' }}>
                تعديل صفحة الذكريات
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/40">
              <h2 className="text-2xl font-serif mb-6" style={{ color: '#4A0404' }}>
                المعلومات الأساسية
              </h2>

              <div className="space-y-6">
                {/* حقل تعديل الـ ID */}
                <div>
                  <Label htmlFor="page_id" className="font-sans mb-2 block">
                    معرف الصفحة
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="page_id"
                      value={formData.page_id}
                      onChange={(e) => setFormData({ ...formData, page_id: e.target.value })}
                      placeholder="أدخل معرف مخصص أو استخدم زر Generate"
                      className="font-sans"
                    />
                    <Button type="button" onClick={generateRandomCode} className="flex items-center gap-1">
                      <Shuffle className="w-4 h-4" /> Generate
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title" className="font-sans mb-2 block">
                    عنوان الصفحة
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="font-sans"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="font-sans mb-2 block">
                    كلمة المرور الجديدة (اتركها فارغة للاحتفاظ بالقديمة)
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="كلمة المرور الجديدة (اختياري)"
                    className="font-sans"
                  />
                </div>

                <div>
                  <Label htmlFor="welcome" className="font-sans mb-2 block">
                    رسالة الترحيب
                  </Label>
                  <Textarea
                    id="welcome"
                    value={formData.welcome_message}
                    onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                    required
                    rows={4}
                    className="font-sans"
                  />
                </div>

                <div>
                  <Label htmlFor="final" className="font-sans mb-2 block">
                    الرسالة النهائية
                  </Label>
                  <Textarea
                    id="final"
                    value={formData.final_message}
                    onChange={(e) => setFormData({ ...formData, final_message: e.target.value })}
                    required
                    rows={4}
                    className="font-sans"
                  />
                </div>
              </div>
            </div>

            {/* الذكريات */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/40">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif" style={{ color: '#4A0404' }}>
                  الذكريات
                </h2>
                <Button
                  type="button"
                  onClick={handleAddMemory}
                  className="rounded-full font-sans"
                  style={{ backgroundColor: '#4A0404' }}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة ذكرى
                </Button>
              </div>

              {memories.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                  <p className="text-gray-500 font-sans">لم تتم إضافة أي ذكريات بعد</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {memories.map((memory, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-xl p-6 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-lg" style={{ color: '#4A0404' }}>
                          ذكرى {index + 1}
                        </span>
                        <Button
                          type="button"
                          onClick={() => handleRemoveMemory(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div>
                        <Label className="font-sans mb-2 block">رفع صورة أو فيديو</Label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <Upload className="w-4 h-4" />
                            <span className="font-sans text-sm">اختر ملف</span>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              onChange={(e) => e.target.files[0] && handleFileUpload(index, e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                          {memory.url && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              {memory.type === "video" ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                              <span>تم الرفع</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="font-sans mb-2 block">النص المرافق</Label>
                        <Textarea
                          value={memory.caption}
                          onChange={(e) => handleMemoryChange(index, "caption", e.target.value)}
                          placeholder="أضف نصاً يصف هذه الذكرى..."
                          rows={3}
                          className="font-sans"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                variant="outline"
                className="font-sans"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="text-white rounded-full px-8 py-3 font-serif"
                style={{ backgroundColor: '#4A0404' }}
              >
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
