import { useState } from "react";
import AppShell from "@/components/AppShell";
import LoginScreen from "@/components/LoginScreen";
import DashboardScreen from "@/components/DashboardScreen";
import ClientsScreen, { type Client } from "@/components/ClientsScreen";
import SubscriptionScreen from "@/components/SubscriptionScreen";
import ZonesScreen, { type Zone } from "@/components/ZonesScreen";
import FATScreen, { type FAT } from "@/components/FATScreen";
import OffresScreen, { defaultOffres, type Offre } from "@/components/OffresScreen";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "gerant" | "vendeur">("admin");
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [offres, setOffres] = useState<Offre[]>(defaultOffres);
  const [clients, setClients] = useState<Client[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [fats, setFats] = useState<FAT[]>([]);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={(role) => { setUserRole(role); setIsLoggedIn(true); }} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <DashboardScreen onNavigate={setCurrentScreen} userRole={userRole} />;
      case "clients":
        return <ClientsScreen userRole={userRole} clients={clients} onClientsChange={setClients} />;
      case "subscriptions":
        return <SubscriptionScreen offres={offres} userRole={userRole} />;
      case "zones":
        return <ZonesScreen userRole={userRole} zones={zones} onZonesChange={setZones} />;
      case "fat":
        return <FATScreen userRole={userRole} fats={fats} onFatsChange={setFats} />;
      case "offres":
        return <OffresScreen offres={offres} onOffresChange={setOffres} />;
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
      userName={userRole === "admin" ? "Admin" : userRole === "gerant" ? "Gérant" : "Vendeur"}
      isOnline={true}
      onLogout={() => setIsLoggedIn(false)}
    >
      {renderScreen()}
    </AppShell>
  );
};

export default Index;
