import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PDGLogin from "./pages/PDGLogin";
import PDGDashboard from "./pages/PDGDashboard";
import NotFound from "./pages/NotFound";
import "./index.css";

const queryClient = new QueryClient();

function PDGApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* PDG Login */}
              <Route path="/" element={<PDGLogin />} />
              <Route path="/login" element={<PDGLogin />} />
              
              {/* PDG Dashboard - Protected */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <PDGDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PDGApp />
  </React.StrictMode>
);