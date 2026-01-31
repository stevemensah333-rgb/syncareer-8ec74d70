import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Stocks from "./pages/Stocks";
import Markets from "./pages/Markets";
import Currencies from "./pages/Currencies";
import Portfolio from "./pages/Portfolio";
import PublicPortfolio from "./pages/PublicPortfolio";
import Performance from "./pages/Performance";
import Analysis from "./pages/Analysis";
import Settings from "./pages/Settings";
import { Navigate } from "react-router-dom";
import AICoach from "./pages/AICoach";
import Onboarding from "./pages/Onboarding";
// New feature pages
import InterviewSimulator from "./pages/InterviewSimulator";
import ApplicationTracker from "./pages/ApplicationTracker";
// Employer pages
import MyCompany from "./pages/employer/MyCompany";
import TalentInsights from "./pages/employer/TalentInsights";
import PostJob from "./pages/employer/PostJob";
import TrainEmployees from "./pages/employer/TrainEmployees";
import HireWithAI from "./pages/employer/HireWithAI";
import ApplicantTracker from "./pages/employer/ApplicantTracker";
// Counsellor pages
import CounsellorDashboard from "./pages/counsellor/CounsellorDashboard";
import CounsellorAvailability from "./pages/counsellor/CounsellorAvailability";
import CounsellorSessions from "./pages/counsellor/CounsellorSessions";
// Community pages
import Communities from "./pages/Communities";
import ExploreCommunities from "./pages/ExploreCommunities";
import CreateCommunity from "./pages/CreateCommunity";
import CommunityDetail from "./pages/CommunityDetail";
import PostDetail from "./pages/PostDetail";
import Landing from "./pages/Landing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProfileProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Navigate to="/" replace />} />
            <Route path="/portfolio/:userId" element={<PublicPortfolio />} />
            
            {/* Protected routes */}
            <Route path="/home" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/skills" element={<ProtectedRoute><Stocks /></ProtectedRoute>} />
            <Route path="/learn" element={<ProtectedRoute><Currencies /></ProtectedRoute>} />
            <Route path="/opportunities" element={<ProtectedRoute><Markets /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
            <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/ai-coach" element={<ProtectedRoute><AICoach /></ProtectedRoute>} />
            
            {/* Protected feature routes */}
            <Route path="/interview-simulator" element={<ProtectedRoute><InterviewSimulator /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />
            
            {/* Protected employer routes */}
            <Route path="/my-company" element={<ProtectedRoute><MyCompany /></ProtectedRoute>} />
            <Route path="/talent-insights" element={<ProtectedRoute><TalentInsights /></ProtectedRoute>} />
            <Route path="/post-job" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
            <Route path="/train" element={<ProtectedRoute><TrainEmployees /></ProtectedRoute>} />
            <Route path="/hire-ai" element={<ProtectedRoute><HireWithAI /></ProtectedRoute>} />
            <Route path="/applicants" element={<ProtectedRoute><ApplicantTracker /></ProtectedRoute>} />
            
            {/* Protected counsellor routes */}
            <Route path="/counsellor-dashboard" element={<ProtectedRoute><CounsellorDashboard /></ProtectedRoute>} />
            <Route path="/counsellor-availability" element={<ProtectedRoute><CounsellorAvailability /></ProtectedRoute>} />
            <Route path="/counsellor-sessions" element={<ProtectedRoute><CounsellorSessions /></ProtectedRoute>} />
            
            {/* Protected community routes */}
            <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
            <Route path="/communities/explore" element={<ProtectedRoute><ExploreCommunities /></ProtectedRoute>} />
            <Route path="/communities/create" element={<ProtectedRoute><CreateCommunity /></ProtectedRoute>} />
            <Route path="/communities/:slug" element={<ProtectedRoute><CommunityDetail /></ProtectedRoute>} />
            <Route path="/communities/post/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserProfileProvider>
  </QueryClientProvider>
);

export default App;
