import { Routes, Route } from 'react-router-dom'
import { MarketingPage } from '@/components/marketing/MarketingPage'
import { LoginPage } from '@/components/auth/LoginPage'
import { SignupPage } from '@/components/auth/SignupPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/components/dashboard/DashboardPage'
import { AssessmentPage } from '@/components/assessment/AssessmentPage'
import { PracticePage } from '@/components/practice/PracticePage'
import { MyPlanPage } from '@/components/plan/MyPlanPage'
import { ProgressPage } from '@/components/progress/ProgressPage'
import { ReflectionsPage } from '@/components/reflections/ReflectionsPage'
import { ResourcesPage } from '@/components/resources/ResourcesPage'
import { AchievementsPage } from '@/components/achievements/AchievementsPage'
import { SettingsPage } from '@/components/settings/SettingsPage'
import { AdminShell } from '@/components/admin/AdminShell'
import { AdminOverview } from '@/components/admin/AdminOverview'
import { AdminUsers } from '@/components/admin/AdminUsers'
import { AdminUserDetail } from '@/components/admin/AdminUserDetail'
import { AdminQuestions } from '@/components/admin/AdminQuestions'
import { AdminContent } from '@/components/admin/AdminContent'
import { AdminAnalytics } from '@/components/admin/AdminAnalytics'

export default function App() {
  return (
    <Routes>
      {/* Cinematic one-page marketing experience */}
      <Route path="/" element={<MarketingPage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Customer app */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="assessment" element={<AssessmentPage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="plan" element={<MyPlanPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="reflections" element={<ReflectionsPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Admin panel */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<MarketingPage />} />
    </Routes>
  )
}
