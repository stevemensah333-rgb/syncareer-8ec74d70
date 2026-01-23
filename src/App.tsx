
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import Index from "./pages/Index";
import Feed from "./pages/Feed";
import NotFound from "./pages/NotFound";
import Stocks from "./pages/Stocks";
import Markets from "./pages/Markets";
import Currencies from "./pages/Currencies";
import Global from "./pages/Global";
import Portfolio from "./pages/Portfolio";
import Performance from "./pages/Performance";
import Analysis from "./pages/Analysis";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import AICoach from "./pages/AICoach";
import Onboarding from "./pages/Onboarding";
// Employer pages
import MyCompany from "./pages/employer/MyCompany";
import TalentInsights from "./pages/employer/TalentInsights";
import PostJob from "./pages/employer/PostJob";
import TrainEmployees from "./pages/employer/TrainEmployees";
import HireWithAI from "./pages/employer/HireWithAI";
// Counsellor pages
import CounsellorDashboard from "./pages/counsellor/CounsellorDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProfileProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/skills" element={<Stocks />} />
            <Route path="/learn" element={<Currencies />} />
            <Route path="/opportunities" element={<Markets />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/global" element={<Global />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ai-coach" element={<AICoach />} />
            {/* Employer routes */}
            <Route path="/my-company" element={<MyCompany />} />
            <Route path="/talent-insights" element={<TalentInsights />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/train" element={<TrainEmployees />} />
            <Route path="/hire-ai" element={<HireWithAI />} />
            {/* Counsellor routes */}
            <Route path="/counsellor-dashboard" element={<CounsellorDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserProfileProvider>
  </QueryClientProvider>
);

export default App;
