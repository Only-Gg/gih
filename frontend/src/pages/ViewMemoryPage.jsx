import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Lock, ChevronRight, ChevronLeft } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ViewMemoryPage() {
  const { id } = useParams();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [memoryData, setMemoryData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/memory-pages/${id}/verify-password`, {
        password,
      });

      if (response.data.success) {
        setMemoryData(response.data.data);
        setAuthenticated(true);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("حدث خطأ في التحقق من كلمة المرور");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < memoryData.memories.length + 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#F5F2EB' }}>
        <div className="texture-overlay fixed inset-0 pointer-events-none opacity-[0.03] z-0"></div>
        
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1749566787207-bd56427f4454?crop=entropy&cs=srgb&fm=jpg&q=85"
            alt="Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(74, 4, 4, 0.3), rgba(74, 4, 4, 0.6))' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 border border-white/40">
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4A0404' }}>
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif text-center mb-2" style={{ color: '#4A0404' }} data-testid="view-page-title">
              صفحة ذكريات
            </h1>
            <p className="text-center text-gray-600 mb-8 font-sans">أدخل كلمة المرور للوصول إلى الذكريات</p>

            <form onSubmit={handlePasswordSubmit} className="space-y-6" data-testid="password-form">
              <div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 focus:border-[#4A0404] font-sans text-center text-lg"
                  placeholder="أدخل كلمة المرور"
                  data-testid="password-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-white rounded-full px-8 py-6 font-serif text-lg tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ backgroundColor: '#4A0404' }}
                data-testid="submit-password-button"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>جاري التحقق...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5" />
                    <span>فتح الذكريات</span>
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    if (currentStep === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-6" data-testid="welcome-step">
          <div className="w-20 h-20 mb-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D4AF37' }}>
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <h2 className="text-4xl md:text-6xl font-serif mb-6" style={{ color: '#4A0404' }}>
            {memoryData.title}
          </h2>
          <p className="text-lg md:text-2xl font-sans leading-relaxed max-w-2xl" style={{ color: '#2C2C2C' }}>
            {memoryData.welcome_message}
          </p>
        </div>
      );
    }

    if (currentStep === memoryData.memories.length + 1) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-6" data-testid="final-step">
          <div className="w-20 h-20 mb-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D4AF37' }}>
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <p className="text-lg md:text-2xl font-sans leading-relaxed max-w-2xl" style={{ color: '#2C2C2C' }}>
            {memoryData.final_message}
          </p>
        </div>
      );
    }

    const memory = memoryData.memories[currentStep - 1];
    return (
      <div className="flex flex-col items-center justify-center h-full px-6" data-testid={`memory-step-${currentStep - 1}`}>
        <div className="max-w-4xl w-full">
          {memory.type === "video" ? (
            <video
              src={memory.url}
              controls
              className="w-full max-h-[60vh] rounded-2xl shadow-2xl mb-8"
              data-testid="memory-video"
            />
          ) : (
            <img
              src={memory.url}
              alt="Memory"
              className="w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl mb-8"
              data-testid="memory-image"
            />
          )}
          {memory.caption && (
            <p className="text-lg md:text-2xl font-sans text-center leading-relaxed" style={{ color: '#2C2C2C' }} data-testid="memory-caption">
              {memory.caption}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#F5F2EB' }}>
      <div className="texture-overlay fixed inset-0 pointer-events-none opacity-[0.03] z-0"></div>

      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1711107754323-97e6db084397?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center py-12">
          {renderStep()}
        </div>

        <div className="pb-12 px-6">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 0}
              variant="outline"
              size="lg"
              className="rounded-full font-sans"
              data-testid="prev-button"
            >
              <ChevronLeft className="w-5 h-5 ml-2" />
              السابق
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: memoryData.memories.length + 2 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'w-8' : ''
                  }`}
                  style={{ backgroundColor: i === currentStep ? '#4A0404' : '#D4AF37' }}
                  data-testid={`progress-dot-${i}`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={currentStep === memoryData.memories.length + 1}
              className="rounded-full font-sans text-white"
              size="lg"
              style={{ backgroundColor: '#4A0404' }}
              data-testid="next-button"
            >
              التالي
              <ChevronRight className="w-5 h-5 mr-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}