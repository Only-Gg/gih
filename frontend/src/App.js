import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import CreateMemoryPage from "@/pages/CreateMemoryPage";
import EditMemoryPage from "@/pages/EditMemoryPage";
import ViewMemoryPage from "@/pages/ViewMemoryPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/create" element={<CreateMemoryPage />} />
          <Route path="/admin/edit/:id" element={<EditMemoryPage />} />
          <Route path="/view/:id" element={<ViewMemoryPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;