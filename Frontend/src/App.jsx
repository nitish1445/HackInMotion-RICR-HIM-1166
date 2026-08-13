import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import { Toaster } from "react-hot-toast";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import DashboardOverview from "./pages/dashboard/Overview";
import GoalsPage from "./pages/dashboard/GoalPage";
import CreateGoalPage from "./pages/dashboard/CreateGoalPage";
import GoalDetailPage from "./pages/dashboard/GoalDetailPage";
import StudyPlanPage from "./pages/dashboard/StudyPlanPage";
import AIAssistantPage from "./pages/dashboard/AIAssistant";
import TestsPage from "./pages/dashboard/TestsPage";
import TestPage from "./pages/dashboard/TestPage";
import ProgressPage from "./pages/dashboard/ProgressPage";
import AchievementsPage from "./pages/dashboard/AchivementPage";
import ProfilePage from "./pages/dashboard/ProfilePage";


const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
};

const App = () => {
  const [theme, setTheme] = useState("light");
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isDashboardRoute = pathname.startsWith("/dashboard");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboardRoute && <Header theme={theme} setTheme={setTheme} />}

      <Toaster />

      <main className={`flex-1 ${!isDashboardRoute ? "pt-16" : ""}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          <Route
            path="/dashboard/*"
            element={<DashboardPage theme={theme} setTheme={setTheme} />}
          >
            {/* /dashboard */}
            <Route index element={<DashboardOverview />} />

            {/* /dashboard/goals */}
            <Route path="goals" element={<GoalsPage />} />

            {/* /dashboard/goals/new */}
            <Route path="goals/new" element={<CreateGoalPage />} />

            {/* /dashboard/goals/:goalId */}
            <Route path="goals/:goalId" element={<GoalDetailPage />} />

            {/* /dashboard/study-plan */}
            <Route path="study-plan" element={<StudyPlanPage />} />

            {/* /dashboard/ai-assistant */}
            <Route path="ai-assistant" element={<AIAssistantPage />} />

            {/* /dashboard/tests */}
            <Route path="tests" element={<TestsPage />} />

            {/* /dashboard/tests/:testId */}
            <Route path="tests/:testId" element={<TestPage />} />

            {/* /dashboard/progress */}
            <Route path="progress" element={<ProgressPage />} />

            {/* /dashboard/achievements */}
            <Route path="achievements" element={<AchievementsPage />} />

            {/* /dashboard/profile */}
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </main>

      {!isAuthPage && !isDashboardRoute && <Footer />}
    </div>
  );
};

export default App;
