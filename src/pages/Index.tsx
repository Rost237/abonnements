import { useState } from "react";
import AppShell from "@/components/AppShell";
import LoginScreen from "@/components/LoginScreen";
import DashboardScreen from "@/components/DashboardScreen";
import ClientsScreen from "@/components/ClientsScreen";
import SubscriptionScreen from "@/components/SubscriptionScreen";
import ZonesScreen from "@/components/ZonesScreen";
import FATScreen from "@/components/FATScreen";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "gerant" | "vendeur">("admin");
  const [currentScreen, setCurrentScreen] = useState("dashboard");

  if (!isLoggedIn) {
    return <LoginScreen onLogin={(role) => { setUserRole(role); setIsLoggedIn(true); }} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <DashboardScreen onNavigate={setCurrentScreen} userRole={userRole} />;
      case "clients":
        return <ClientsScreen />;
      case "subscriptions":
        return <SubscriptionScreen />;
      case "reports":
        return <div className="space-y-4"><h2 className="text-xl font-bold text-foreground">Rapports</h2><p className="text-muted-foreground text-sm">Les rapports seront disponibles avec Lovable Cloud.</p></div>;
      case "performance":
        return <div className="space-y-4"><h2 className="text-xl font-bold text-foreground">Performance</h2><p className="text-muted-foreground text-sm">Le suivi des performances sera disponible avec Lovable Cloud.</p></div>;
      case "users":
        return <div className="space-y-4"><h2 className="text-xl font-bold text-foreground">Utilisateurs</h2><p className="text-muted-foreground text-sm">La gestion des utilisateurs sera disponible avec Lovable Cloud.</p></div>;
      case "settings":
        return <div className="space-y-4"><h2 className="text-xl font-bold text-foreground">Paramètres</h2><p className="text-muted-foreground text-sm">Les paramètres seront disponibles avec Lovable Cloud.</p></div>;
      default:
        return <DashboardScreen onNavigate={setCurrentScreen} userRole={userRole} />;
    }
  };

  return (
    <AppShell
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      userRole={userRole}
      userName={userRole === "admin" ? "Admin" : "Vendeur"}
      isOnline={true}
      onLogout={() => setIsLoggedIn(false)}
    >
      {renderScreen()}
    </AppShell>
  );
};

export default Index;
