import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RouteGuard } from "./components/RouteGuard";
import { Layout } from "./components/Layout";
import { Toaster } from "sonner";
import { useNotificationSSE } from "./hooks/useNotificationSSE";

// Lazy-loaded pages
const SignInView = lazy(() => import("./pages/auth/SignInView").then(module => ({ default: module.SignInView })));
const SignUpView = lazy(() => import("./pages/auth/SignUpView").then(module => ({ default: module.SignUpView })));
const ForgotPasswordView = lazy(() => import("./pages/auth/ForgotPasswordView").then(module => ({ default: module.ForgotPasswordView })));
const ResetPasswordView = lazy(() => import("./pages/auth/ResetPasswordView").then(module => ({ default: module.ResetPasswordView })));
const VerifyEmailView = lazy(() => import("./pages/auth/VerifyEmailView").then(module => ({ default: module.VerifyEmailView })));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage").then(module => ({ default: module.DashboardPage })));
const ResumeListPage = lazy(() => import("./pages/resumes/ResumeListPage").then(module => ({ default: module.ResumeListPage })));
const ResumeDetailPage = lazy(() => import("./pages/resumes/ResumeDetailPage").then(module => ({ default: module.ResumeDetailPage })));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage").then(module => ({ default: module.SettingsPage })));
const AutoApplyPage = lazy(() => import("./pages/dashboard/AutoApplyPage").then(module => ({ default: module.AutoApplyPage })));
const AIConfigPage = lazy(() => import("./pages/dashboard/AIConfigPage").then(module => ({ default: module.AIConfigPage })));
const BrowserConnectionsPage = lazy(() => import("./pages/dashboard/BrowserConnectionsPage").then(module => ({ default: module.BrowserConnectionsPage })));
const OAuthCallbackView = lazy(() => import("./pages/auth/OAuthCallbackView").then(module => ({ default: module.OAuthCallbackView })));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout").then(module => ({ default: module.AdminLayout })));
const AdminOverviewPage = lazy(() => import("./pages/admin/AdminOverviewPage").then(module => ({ default: module.AdminOverviewPage })));
const AdminUserManagementPage = lazy(() => import("./pages/admin/AdminUserManagementPage").then(module => ({ default: module.AdminUserManagementPage })));
const AdminSystemMonitoringPage = lazy(() => import("./pages/admin/AdminSystemMonitoringPage").then(module => ({ default: module.AdminSystemMonitoringPage })));
const AdminFeatureFlagsPage = lazy(() => import("./pages/admin/AdminFeatureFlagsPage").then(module => ({ default: module.AdminFeatureFlagsPage })));
const AdminCompliancePage = lazy(() => import("./pages/admin/AdminCompliancePage").then(module => ({ default: module.AdminCompliancePage })));
const PublicLandingPage = lazy(() => import("./pages/public/PublicLandingPage").then(module => ({ default: module.PublicLandingPage })));
const SystemStatusPage = lazy(() => import("./pages/public/SystemStatusPage").then(module => ({ default: module.SystemStatusPage })));
const TrustCenterPage = lazy(() => import("./pages/public/TrustCenterPage").then(module => ({ default: module.TrustCenterPage })));
const PrivacyPolicyPage = lazy(() => import("./pages/public/legal/PrivacyPolicyPage").then(module => ({ default: module.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import("./pages/public/legal/TermsOfServicePage").then(module => ({ default: module.TermsOfServicePage })));
const CookiePolicyPage = lazy(() => import("./pages/public/legal/CookiePolicyPage").then(module => ({ default: module.CookiePolicyPage })));
const RefundPolicyPage = lazy(() => import("./pages/public/legal/RefundPolicyPage").then(module => ({ default: module.RefundPolicyPage })));
const DataRetentionPolicyPage = lazy(() => import("./pages/public/legal/DataRetentionPolicyPage").then(module => ({ default: module.DataRetentionPolicyPage })));
const AcceptableUsePolicyPage = lazy(() => import("./pages/public/legal/AcceptableUsePolicyPage").then(module => ({ default: module.AcceptableUsePolicyPage })));
const AIUsagePolicyPage = lazy(() => import("./pages/public/legal/AIUsagePolicyPage").then(module => ({ default: module.AIUsagePolicyPage })));
const ExtensionPrivacyPolicyPage = lazy(() => import("./pages/public/legal/ExtensionPrivacyPolicyPage").then(module => ({ default: module.ExtensionPrivacyPolicyPage })));
const SecurityPolicyPage = lazy(() => import("./pages/public/legal/SecurityPolicyPage").then(module => ({ default: module.SecurityPolicyPage })));
const VulnerabilityDisclosurePage = lazy(() => import("./pages/public/legal/VulnerabilityDisclosurePage").then(module => ({ default: module.VulnerabilityDisclosurePage })));
const DMCAPolicyPage = lazy(() => import("./pages/public/legal/DMCAPolicyPage").then(module => ({ default: module.DMCAPolicyPage })));
const ContactSupportPage = lazy(() => import("./pages/public/legal/ContactSupportPage").then(module => ({ default: module.ContactSupportPage })));
const AboutUsPage = lazy(() => import("./pages/public/legal/AboutUsPage").then(module => ({ default: module.AboutUsPage })));
const DeveloperKeysPage = lazy(() => import("./pages/dashboard/DeveloperKeysPage").then(module => ({ default: module.DeveloperKeysPage })));

export const App: React.FC = () => {
  useNotificationSSE();

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Suspense
        fallback={
          <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
            <div className="relative h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        }
      >
        <Routes>
          {/* Public / Guest-only Routes */}
          <Route
            path="/login"
            element={
              <RouteGuard publicOnly>
                <SignInView />
              </RouteGuard>
            }
          />
          <Route
            path="/register"
            element={
              <RouteGuard publicOnly>
                <SignUpView />
              </RouteGuard>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <RouteGuard publicOnly>
                <ForgotPasswordView />
              </RouteGuard>
            }
          />
          <Route
            path="/reset-password"
            element={
              <RouteGuard publicOnly>
                <ResetPasswordView />
              </RouteGuard>
            }
          />
          <Route
            path="/verify-email"
            element={
              <VerifyEmailView />
            }
          />
          <Route
            path="/oauth/callback/:provider"
            element={
              <OAuthCallbackView />
            }
          />

          {/* Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <RouteGuard>
                <Layout>
                  <DashboardPage />
                </Layout>
              </RouteGuard>
            }
          />
          <Route
            path="/auto-apply/:platform"
            element={
              <RouteGuard>
                <Layout>
                  <AutoApplyPage />
                </Layout>
              </RouteGuard>
            }
          />
          <Route
            path="/resumes"
            element={
              <RouteGuard>
                <Layout>
                  <ResumeListPage />
                </Layout>
              </RouteGuard>
            }
          />
          <Route
            path="/resumes/:id"
            element={
              <RouteGuard>
                <Layout>
                  <ResumeDetailPage />
                </Layout>
              </RouteGuard>
            }
          />
          <Route
            path="/ai-config"
            element={
              <RouteGuard>
                <Layout>
                  <AIConfigPage />
                </Layout>
              </RouteGuard>
            }
          />
          <Route
            path="/browser-connections"
            element={
              <RouteGuard>
                <Layout>
                  <BrowserConnectionsPage />
                </Layout>
              </RouteGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <RouteGuard>
                <Layout>
                  <SettingsPage />
                </Layout>
              </RouteGuard>
            }
          />

          {/* Admin Enterprise Routes */}
          <Route
            path="/admin"
            element={
              <RouteGuard>
                <AdminLayout>
                  <AdminOverviewPage />
                </AdminLayout>
              </RouteGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RouteGuard>
                <AdminLayout>
                  <AdminUserManagementPage />
                </AdminLayout>
              </RouteGuard>
            }
          />
          <Route
            path="/admin/monitoring"
            element={
              <RouteGuard>
                <AdminLayout>
                  <AdminSystemMonitoringPage />
                </AdminLayout>
              </RouteGuard>
            }
          />
          <Route
            path="/admin/feature-flags"
            element={
              <RouteGuard>
                <AdminLayout>
                  <AdminFeatureFlagsPage />
                </AdminLayout>
              </RouteGuard>
            }
          />
          <Route
            path="/admin/compliance"
            element={
              <RouteGuard>
                <AdminLayout>
                  <AdminCompliancePage />
                </AdminLayout>
              </RouteGuard>
            }
          />

          <Route
            path="/developer-keys"
            element={
              <RouteGuard>
                <Layout>
                  <DeveloperKeysPage />
                </Layout>
              </RouteGuard>
            }
          />

          {/* Public Portal & Trust Center Routes */}
          <Route path="/" element={<PublicLandingPage />} />
          <Route path="/status" element={<SystemStatusPage />} />
          <Route path="/trust-center" element={<TrustCenterPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/data-retention" element={<DataRetentionPolicyPage />} />
          <Route path="/acceptable-use" element={<AcceptableUsePolicyPage />} />
          <Route path="/ai-usage" element={<AIUsagePolicyPage />} />
          <Route path="/extension-privacy" element={<ExtensionPrivacyPolicyPage />} />
          <Route path="/security-policy" element={<SecurityPolicyPage />} />
          <Route path="/vulnerability-disclosure" element={<VulnerabilityDisclosurePage />} />
          <Route path="/dmca" element={<DMCAPolicyPage />} />
          <Route path="/contact" element={<ContactSupportPage />} />
          <Route path="/about" element={<AboutUsPage />} />

          {/* Default Redirects */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
