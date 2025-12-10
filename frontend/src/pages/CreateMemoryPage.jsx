import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Plus, Trash2, Upload, ArrowLeft, Image as ImageIcon, Video } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CreateMemoryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    password: "",
    welcome_message: "",
    final_message: "",
  });
  const [memories, setMemories] = useState([]);

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
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API}/upload`, formData, {
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

    setLoading(true);

    try {
      const payload = {
        ...formData,
        memories: memories.map((m, i) => ({ ...m, order: i })),
      };

      const response = await axios.post(`${API}/memory-pages`, payload);
      toast.success("تم إنشاء صفحة الذكريات بنجاح");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error("حدث خطأ في إنشاء الصفحة");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
              data-testid="back-button"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4A0404' }}>
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-serif" style={{ color: '#4A0404' }} data-testid="create-page-title">
                إنشاء صفحة ذكريات
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <form onSubmit={handleSubmit} className="space-y-8" data-testid="create-memory-form">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/40">
              <h2 className="text-2xl font-serif mb-6" style={{ color: '#4A0404' }}>
                المعلومات الأساسية
              </h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="font-sans mb-2 block">
                    عنوان الصفحة
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="مثال: ذكرياتنا الجميلة"
                    className="font-sans"
                    data-testid="title-input"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="font-sans mb-2 block">
                    كلمة المرور للصفحة
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="أدخل كلمة مرور للوصول إلى الصفحة"
                    className="font-sans"
                    data-testid="password-input"
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
                    placeholder="الرسالة التي ستظهر في البداية..."
                    rows={4}
                    className="font-sans"
                    data-testid="welcome-message-input"
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
                    placeholder="الرسالة التي ستظهر في النهاية..."
                    rows={4}
                    className="font-sans"
                    data-testid="final-message-input"
                  />
                </div>
              </div>
            </div>

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
                  data-testid="add-memory-button"
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
                <div className="space-y-6" data-testid="memories-list">
                  {memories.map((memory, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-xl p-6 space-y-4"
                      data-testid={`memory-item-${index}`}
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
                          data-testid={`remove-memory-${index}`}
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
                              data-testid={`file-input-${index}`}
                            />
                          </label>
                          {memory.url && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              {memory.type === "video" ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                              <span>تم الرفع بنجاح</span>
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
                          data-testid={`caption-input-${index}`}
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
                data-testid="cancel-button"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="text-white rounded-full px-8 py-3 font-serif"
                style={{ backgroundColor: '#4A0404' }}
                data-testid="submit-button"
              >
                {loading ? "جاري الإنشاء..." : "إنشاء الصفحة"}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}