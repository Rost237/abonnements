import { useState } from "react";
import { motion } from "framer-motion";
import { Wifi, WifiOff, LayoutDashboard, Users, Radio, UserCircle, Settings, LogOut, FileText, Target, MapPinned, Cable } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Users, label: "Clients", id: "clients" },
  { icon: Radio, label: "Abonnements", id: "subscriptions" },
  { icon: MapPinned, label: "Zones", id: "zones", adminOnly: true },
  { icon: Cable, label: "FAT", id: "fat", adminOnly: true },
  { icon: FileText, label: "Rapports", id: "reports" },
  { icon: Target, label: "Performance", id: "performance" },
  { icon: UserCircle, label: "Utilisateurs", id: "users" },
  { icon: Settings, label: "Paramètres", id: "settings" },
];

interface AppShellProps {
  children: React.ReactNode;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  userRole?: "admin" | "gerant" | "vendeur";
  userName?: string;
  isOnline?: boolean;
  onLogout: () => void;
}

export default function AppShell({ children, currentScreen, onNavigate, userRole = "admin", userName = "Admin", isOnline = true, onLogout }: AppShellProps) {
  const filteredNav = navItems.filter(item => {
    if (item.adminOnly && userRole !== "admin") return false;
    if (userRole === "vendeur") return ["dashboard", "clients", "subscriptions", "performance"].includes(item.id);
    if (userRole === "gerant") return ["dashboard", "clients", "subscriptions", "reports", "performance"].includes(item.id);
    return true;
  });

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card shadow-card border-r border-border">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold tracking-tight text-foreground">ISP Manager</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{userName} · {userRole}</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {filteredNav.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150",
                currentScreen === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs">
            {isOnline ? (
              <><Wifi size={14} className="text-success" /><span className="text-success">En ligne</span></>
            ) : (
              <><WifiOff size={14} className="text-destructive" /><span className="text-destructive">Hors ligne</span></>
            )}
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-card shadow-card border-b border-border">
          <h1 className="text-base font-bold text-foreground">ISP Manager</h1>
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi size={16} className="text-success" /> : <WifiOff size={16} className="text-destructive" />}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden flex items-center justify-around bg-card border-t border-border py-2 px-1">
          {filteredNav.slice(0, 5).map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-md text-xs transition-colors",
                currentScreen === item.id ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon size={20} />
              <span className="truncate max-w-[60px]">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
