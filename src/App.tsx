
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Stocks from "./pages/Stocks";
import Markets from "./pages/Markets";
import Currencies from "./pages/Currencies";

import Portfolio from "./pages/Portfolio";
import PublicPortfolio from "./pages/PublicPortfolio";
import Performance from "./pages/Performance";
import Analysis from "./pages/Analysis";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import AICoach from "./pages/AICoach";
import Onboarding from "./pages/Onboarding";
// New feature pages
import InterviewSimulator from "./pages/InterviewSimulator";
import ResumeBuilder from "./pages/ResumeBuilder";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProfileProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Communities />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/skills" element={<Stocks />} />
            <Route path="/learn" element={<Currencies />} />
            <Route path="/opportunities" element={<Markets />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:userId" element={<PublicPortfolio />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/analysis" element={<Analysis />} />
            
            <Route path="/settings" element={<Settings />} />
            <Route path="/ai-coach" element={<AICoach />} />
            {/* New feature routes */}
            <Route path="/interview-simulator" element={<InterviewSimulator />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/applications" element={<ApplicationTracker />} />
            {/* Employer routes */}
            <Route path="/my-company" element={<MyCompany />} />
            <Route path="/talent-insights" element={<TalentInsights />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/train" element={<TrainEmployees />} />
            <Route path="/hire-ai" element={<HireWithAI />} />
            <Route path="/applicants" element={<ApplicantTracker />} />
            {/* Counsellor routes */}
            <Route path="/counsellor-dashboard" element={<CounsellorDashboard />} />
            <Route path="/counsellor-availability" element={<CounsellorAvailability />} />
            <Route path="/counsellor-sessions" element={<CounsellorSessions />} />
            {/* Community routes */}
            <Route path="/communities" element={<Communities />} />
            <Route path="/communities/explore" element={<ExploreCommunities />} />
            <Route path="/communities/create" element={<CreateCommunity />} />
            <Route path="/communities/:slug" element={<CommunityDetail />} />
            <Route path="/communities/post/:postId" element={<PostDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserProfileProvider>
  </QueryClientProvider>
);

export default App;
