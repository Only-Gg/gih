import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Heart, Lock } from "lucide-react";

const BACKEND_URL = "https://gih-production.up.railway.app";
const API = `${BACKEND_URL}/api`;

export default function ViewMemoryPage() {
  const { id } = useParams();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [memoryData, setMemoryData] = useState(null);
  const [revealedIndexes, setRevealedIndexes] = useState([]);
  const [showFinal, setShowFinal] = useState(false);
  const [typeText, setTypeText] = useState("");

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/memory-pages/${id}/verify-password`, { password });
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

  useEffect(() => {
    if (!authenticated || !memoryData) return;
    // cinematic reveal: كل ذكرى تظهر بعد delay
    memoryData.memories.forEach((_, idx) => {
      setTimeout(() => setRevealedIndexes(prev => prev.includes(idx) ? prev : [...prev, idx]), idx * 500);
    });
  }, [authenticated, memoryData]);

  useEffect(() => {
    if (!showFinal || !memoryData) return;
    const text = memoryData.final_message || "";
    setTypeText("");
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setTypeText(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, [showFinal, memoryData]);

  const getSafeUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return url.startsWith("/") ? `${BACKEND_URL}${url}` : `${BACKEND_URL}/${url}`;
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "#0f0f12" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {Array.from({ length: 15 }).map((_, i) => {
            const left = Math.random() * 100;
            const size = 14 + Math.random() * 40;
            const delay = Math.random() * 5;
            return (
              <span key={i} style={{
                position: "absolute",
                left: `${left}%`,
                top: `${110 + Math.random() * 20}%`,
                fontSize: `${size}px`,
                color: "rgba(255,100,160,0.8)",
                animation: `floatUp 12s linear ${delay}s infinite`,
                textShadow: "0 8px 24px rgba(255,80,140,0.2)"
              }}>♥</span>
            );
          })}
        </div>

        <div className="relative z-10 w-full max-w-lg px-6">
          <div className="bg-black/50 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl text-center">
            <div className="flex justify-center mb-6">
              <div style={{ width: 80, height: 80, borderRadius: 9999, background: "linear-gradient(45deg,#ff6b81,#ff9eda)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(255,80,120,0.25)" }}>
                <Heart style={{ width: 36, height: 36, color: "white" }} />
              </div>
            </div>
            <h1 className="text-center font-serif mb-4" style={{
              fontSize: "2.8rem",
              color: "#FFD6DA",
              textShadow: "0 0 20px rgba(255,140,160,0.95),0 6px 30px rgba(0,0,0,0.6)"
            }}>{memoryData?.title || "OnlyGg Lovely ♥"}</h1>
            <p className="text-center text-sm text-gray-200/80 mb-6">أدخل كلمة المرور لفتح صفحة الذكريات — لحظاتك بتنتظر ✨</p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-lg border-0 text-center text-lg font-serif" placeholder="أدخل كلمة المرور" />
              <button type="submit" disabled={loading} className="w-full text-white rounded-full px-6 py-3 font-serif" style={{ background: "linear-gradient(90deg,#ff6b81,#ff9eda)" }}>
                {loading ? "جاري التحقق..." : <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><Lock style={{ width: 16, height: 16 }} /> افتح الذكريات</span>}
              </button>
            </form>
          </div>
        </div>

        <style>{`
          @keyframes floatUp {0% {transform:translateY(0) rotate(0deg); opacity:0;} 10%{opacity:1;}100%{transform:translateY(-140vh) rotate(360deg);opacity:0;}}
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center" style={{ background: "linear-gradient(135deg, #0f0f12 0%, #1a0f2a 100%)", padding: "40px 20px" }}>
      {/* floating hearts */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {Array.from({ length: 20 }).map((_, i) => {
          const left = Math.random() * 100;
          const size = 14 + Math.random() * 40;
          const delay = Math.random() * 5;
          return (
            <span key={i} style={{
              position: "absolute",
              left: `${left}%`,
              top: `${Math.random()*100}%`,
              fontSize: `${size}px`,
              color: "rgba(255,100,160,0.8)",
              animation: `floatUp 12s linear ${delay}s infinite`,
              textShadow: "0 8px 24px rgba(255,80,140,0.2)"
            }}>♥</span>
          );
        })}
      </div>

      <div className="relative z-10 w-full max-w-lg space-y-6">
        {memoryData.memories.map((mem, idx) => {
          const revealed = revealedIndexes.includes(idx);
          return (
            <div key={idx} className={`bg-black/40 backdrop-blur-md rounded-3xl p-5 border border-white/10 shadow-2xl transition-all duration-500 ${revealed ? "opacity-100 scale-100" : "opacity-0 scale-95"}`} style={{ textAlign: "center" }}>
              {mem.type === "video" ? (
                <video src={getSafeUrl(mem.url)} controls className="w-full rounded-xl" />
              ) : (
                <img src={getSafeUrl(mem.url)} alt="Memory" className="w-full rounded-xl object-contain" />
              )}
              {mem.caption && (
                <p className="mt-2 text-lg font-serif text-[#ffd1dc]" style={{ textShadow: "0 0 20px #ff9eda, 0 0 30px #ff6b81" }}>{mem.caption}</p>
              )}
            </div>
          );
        })}

        {/* final message */}
        <div className="mt-6 text-center">
          {!showFinal ? (
            <Button onClick={() => setShowFinal(true)} className="rounded-full px-8 py-3 text-white font-serif" style={{ background: "linear-gradient(90deg,#ff6b81,#ff9eda)" }}>دوس هقولك حاجة</Button>
          ) : (
            <p className="mt-4 text-lg font-serif text-[#fff]" style={{ textShadow: "0 6px 22px rgba(0,0,0,0.5)" }}>{typeText}</p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes floatUp {0% {transform:translateY(0) rotate(0deg); opacity:0;} 10%{opacity:1;}100%{transform:translateY(-140vh) rotate(360deg);opacity:0;}}
      `}</style>
    </div>
  );
}
