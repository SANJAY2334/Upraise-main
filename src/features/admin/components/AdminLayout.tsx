import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

type Props = {
  activeModule: string;
  setActiveModule: (m: string) => void;
  adminModules: Array<{ key: string; icon: React.ElementType }>;
  email?: string | undefined;
  onLogout: () => void;
  children: React.ReactNode;
};

export default function AdminLayout({ activeModule, setActiveModule, adminModules, email, onLogout, children }: Props) {
  return (
    <main id="main-content" className="min-h-screen bg-[#080808] pt-20">
      <section className="grid min-h-[calc(100vh-80px)] lg:grid-cols-[280px_1fr]">
        <AdminSidebar
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          adminModules={adminModules}
          email={email}
          onLogout={onLogout}
        />
        <div className="p-4 sm:p-8 overflow-auto">
          <AdminTopbar activeModule={activeModule} />
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
