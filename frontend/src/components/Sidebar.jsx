import {
  LayoutDashboard,
  ListChecks,
  ShieldAlert,
  Ban,
  LogOut,
  Shield,
} from "lucide-react";

function Sidebar({ activeSection, onNavigate, onLogout }) {
  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "login-logs",
      label: "Login Logs",
      icon: ListChecks,
    },
    {
      id: "security-events",
      label: "Security Events",
      icon: ShieldAlert,
    },
    {
      id: "blocked-ips",
      label: "Blocked IPs",
      icon: Ban,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col">

      {/* Logo */}

      <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-400" />
        </div>

        <div>
          <h1 className="font-bold text-white">
            Security Monitor
          </h1>

          <p className="text-xs text-slate-500">
            Security Console
          </p>
        </div>
      </div>

      {/* Navigation */}

      <nav className="flex-1 px-4 py-6 space-y-2">

        <p className="px-3 mb-3 text-xs uppercase tracking-wider text-slate-600">
          Monitoring
        </p>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600/15 text-blue-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}

      </nav>

      {/* Logout */}

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;