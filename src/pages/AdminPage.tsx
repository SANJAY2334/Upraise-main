import { BarChart3, Briefcase, Image as ImageIcon, Layers, Lock, MessageSquare, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AdminLayout,
  DashboardPanel,
  LeadsPanel,
  MessagesPanel,
  ServicesPanel,
  ProjectsPanel,
  MediaPanel,
  AnalyticsPanel,
  AuditLogsPanel,
  SuperAdminPanel
} from "../features/admin";
import { useToast, ErrorBoundary } from "../shared/components";
import { useAuth } from "../shared/providers";
import { applySeo } from "../shared/utils";

const adminModules = [
  { key: "Dashboard", icon: BarChart3 },
  { key: "Lead Management", icon: Users },
  { key: "Contact Messages", icon: MessageSquare },
  { key: "Services CMS", icon: Briefcase },
  { key: "Portfolio", icon: Layers },
  { key: "Media Library", icon: ImageIcon },
  { key: "Analytics", icon: BarChart3 },
  { key: "Audit Logs", icon: Lock }
];

export default function AdminPage() {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("Dashboard");
  const toast = useToast();

  useEffect(() => {
    applySeo({
      title: "UPRISE Admin | CMS, CRM & SEO Dashboard",
      description: "UPRISE admin dashboard",
      path: "/admin"
    });
  }, []);

  if (state.status === "unauthenticated") {
    navigate("/admin/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
    toast("success", "Signed out successfully.");
  };

  const modules = [...adminModules];
  const isSuperAdmin = state.status === "authenticated" && state.user.role === "SUPER_ADMIN";
  if (isSuperAdmin) {
    modules.push({ key: "Super Admin Portal", icon: Lock });
  }

  return (
    <AdminLayout
      activeModule={activeModule}
      setActiveModule={setActiveModule}
      adminModules={modules}
      email={state.status === "authenticated" ? state.user.email : undefined}
      onLogout={handleLogout}
    >
      <ErrorBoundary>
        {activeModule === "Dashboard" && <DashboardPanel />}
        {activeModule === "Lead Management" && <LeadsPanel />}
        {activeModule === "Contact Messages" && <MessagesPanel />}
        {activeModule === "Services CMS" && <ServicesPanel />}
        {activeModule === "Portfolio" && <ProjectsPanel />}
        {activeModule === "Media Library" && <MediaPanel />}
        {activeModule === "Analytics" && <AnalyticsPanel />}
        {activeModule === "Audit Logs" && <AuditLogsPanel />}
        {activeModule === "Super Admin Portal" && <SuperAdminPanel />}
      </ErrorBoundary>
    </AdminLayout>
  );
}
