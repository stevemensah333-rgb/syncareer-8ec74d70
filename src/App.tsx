import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { LoadingFallback } from "./components/LoadingFallback";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Lazy-loaded pages
const Landing = lazy(() => import("./pages/Landing"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const PublicPortfolio = lazy(() => import("./pages/PublicPortfolio"));

// Core pages
const Assessment = lazy(() => import("./pages/Assessment"));
const Stocks = lazy(() => import("./pages/Stocks"));
const Currencies = lazy(() => import("./pages/Currencies"));
const Markets = lazy(() => import("./pages/Markets"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Performance = lazy(() => import("./pages/Performance"));
const Analysis = lazy(() => import("./pages/Analysis"));
const Settings = lazy(() => import("./pages/Settings"));
const AICoach = lazy(() => import("./pages/AICoach"));

// Feature pages
const InterviewSimulator = lazy(() => import("./pages/InterviewSimulator"));
const ApplicationTracker = lazy(() => import("./pages/ApplicationTracker"));
const CVBuilder = lazy(() => import("./pages/CVBuilder"));

// Employer pages
const MyCompany = lazy(() => import("./pages/employer/MyCompany"));
const TalentInsights = lazy(() => import("./pages/employer/TalentInsights"));
const PostJob = lazy(() => import("./pages/employer/PostJob"));
const TrainEmployees = lazy(() => import("./pages/employer/TrainEmployees"));
const HireWithAI = lazy(() => import("./pages/employer/HireWithAI"));
const ApplicantTracker = lazy(() => import("./pages/employer/ApplicantTracker"));

// Counsellor pages
const CounsellorDashboard = lazy(() => import("./pages/counsellor/CounsellorDashboard"));
const CounsellorAvailability = lazy(() => import("./pages/counsellor/CounsellorAvailability"));
const CounsellorSessions = lazy(() => import("./pages/counsellor/CounsellorSessions"));

const queryClient = new QueryClient();

const App = () => (
  <GlobalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <UserProfileProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Navigate to="/" replace />} />
                <Route path="/portfolio/:userId" element={<PublicPortfolio />} />
                
                {/* Protected routes */}
                <Route path="/home" element={<Navigate to="/portfolio" replace />} />
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
                <Route path="/cv-builder" element={<ProtectedRoute><CVBuilder /></ProtectedRoute>} />
                
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
                
                {/* Assessment route */}
                <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </UserProfileProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;
