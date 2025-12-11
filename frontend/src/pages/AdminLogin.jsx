import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Lock } from "lucide-react";

const BACKEND_URL = "https://gih-production.up.railway.app";
const API = `https://gih-production.up.railway.app/api`;

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/admin-login`, {
        username,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("admin_token", response.data.token);
        toast.success(response.data.message);
        navigate("/admin/dashboard");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("حدث خطأ في تسجيل الدخول");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#F5F2EB' }}>
      <div className="texture-overlay fixed inset-0 pointer-events-none opacity-[0.03] z-0"></div>
      
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1751210288343-fd0090170715?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(74, 4, 4, 0.2), rgba(74, 4, 4, 0.4))' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 border border-white/40">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4A0404' }}>
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif text-center mb-2" style={{ color: '#4A0404' }} data-testid="admin-login-title">
            لوحة الإدارة
          </h1>
          <p className="text-center text-gray-600 mb-8 font-sans">تسجيل الدخول لإنشاء صفحات الذكريات</p>

          <form onSubmit={handleLogin} className="space-y-6" data-testid="admin-login-form">
            <div>
              <Label htmlFor="username" className="text-sm font-sans mb-2 block" style={{ color: '#2C2C2C' }}>
                اسم المستخدم
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border-2 focus:border-[#4A0404] font-sans"
                placeholder="Username"
                data-testid="username-input"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-sans mb-2 block" style={{ color: '#2C2C2C' }}>
                كلمة المرور
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border-2 focus:border-[#4A0404] font-sans"
                placeholder="••••••"
                data-testid="password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-white rounded-full px-8 py-6 font-serif text-lg tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ backgroundColor: '#4A0404' }}
              data-testid="login-button"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>جاري التحميل...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5" />
                  <span>تسجيل الدخول</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">

          </div>
        </div>
      </div>
    </div>
  );
}