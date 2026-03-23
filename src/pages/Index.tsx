import { useState } from "react";
import AppShell from "@/components/AppShell";
import LoginScreen from "@/components/LoginScreen";
import DashboardScreen from "@/components/DashboardScreen";
import ClientsScreen from "@/components/ClientsScreen";
import SubscriptionScreen from "@/components/SubscriptionScreen";
import ZonesScreen from "@/components/ZonesScreen";
import FATScreen from "@/components/FATScreen";
import OffresScreen, { defaultOffreGroups } from "@/components/OffresScreen";
import UsersScreen from "@/components/UsersScreen";
import SettingsScreen from "@/components/SettingsScreen";
import SectorsScreen from "@/components/SectorsScreen";
import ActivityLogScreen from "@/components/ActivityLogScreen";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTheme } from "@/hooks/useTheme";
import type { AppUser, Client, Zone, FAT, Sector, OffreGroup, Subscription, CompanyConfig, ActivityLog } from "@/types";

const defaultUsers: AppUser[] = [
  {
    id: "admin-root",
    login: "admin",
    password: "admin",
    role: "admin",
    name: "Administrateur",
    mustChangePassword: false,
    zones: [],
    secteurs: [],
    objectifMensuel: 0,
  },
  {
    id: "gerant-default",
    login: "Gerant",
    password: "g2026",
    role: "gerant",
    name: "Gérant",
    mustChangePassword: true,
    zones: [],
    secteurs: [],
    objectifMensuel: 0,
  },
  {
    id: "vendeur1-default",
    login: "vendeur1",
    password: "v12026",
    role: "vendeur",
    name: "Vendeur 1",
    mustChangePassword: true,
    zones: [],
    secteurs: [],
    objectifMensuel: 0,
  },
];

const defaultConfig: CompanyConfig = {
  nom: "", sigle: "", regime: "", capital: "", rccm: "", compteBancaire: "",
  localisation: "", contacts: "", siteWeb: "", boitePostale: "",
  devise: "FCFA",
  modesPaiement: ["Espèces", "Mobile Money", "Virement bancaire"],
  logo: "",
};

const Index = () => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [users, setUsers] = useLocalStorage<AppUser[]>("isp_users", defaultUsers);
  const [offreGroups, setOffreGroups] = useLocalStorage<OffreGroup[]>("isp_offres", defaultOffreGroups);
  const [clients, setClients] = useLocalStorage<Client[]>("isp_clients", []);
  const [zones, setZones] = useLocalStorage<Zone[]>("isp_zones", []);
  const [fats, setFats] = useLocalStorage<FAT[]>("isp_fats", []);
  const [sectors, setSectors] = useLocalStorage<Sector[]>("isp_sectors", []);
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>("isp_subscriptions", []);
  const [config, setConfig] = useLocalStorage<CompanyConfig>("isp_config", defaultConfig);
  const [activityLogs, setActivityLogs] = useLocalStorage<ActivityLog[]>("isp_activity_logs", []);
  const { theme, toggle: toggleDark } = useTheme();

  const handleLogin = (user: AppUser) => {
    const freshUser = users.find(u => u.id === user.id);
    setCurrentUser(freshUser || user);
  };
  const handleChangePassword = (userId: string, newPassword: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword, mustChangePassword: false } : u));
    setCurrentUser(prev => prev && prev.id === userId ? { ...prev, password: newPassword, mustChangePassword: false } : prev);
  };
  const handleLogout = () => { setCurrentUser(null); setCurrentScreen("dashboard"); };

  if (!currentUser) {
    return <LoginScreen users={users} onLogin={handleLogin} onChangePassword={handleChangePassword} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <DashboardScreen onNavigate={setCurrentScreen} userRole={currentUser.role} currentUser={currentUser} clients={clients} subscriptions={subscriptions} users={users} config={config} zones={zones} />;
      case "clients":
        return <ClientsScreen userRole={currentUser.role} clients={clients} onClientsChange={setClients} zones={zones} sectors={sectors} subscriptions={subscriptions} onNavigateToSubscription={(clientId) => setCurrentScreen("subscriptions")} />;
      case "subscriptions":
        return <SubscriptionScreen offreGroups={offreGroups} userRole={currentUser.role} currentUser={currentUser} clients={clients} onClientsChange={setClients} zones={zones} sectors={sectors} onSectorsChange={setSectors} fats={fats} users={users} subscriptions={subscriptions} onSubscriptionsChange={setSubscriptions} config={config} />;
      case "zones":
        return <ZonesScreen userRole={currentUser.role} zones={zones} onZonesChange={setZones} />;
      case "sectors":
        return <SectorsScreen sectors={sectors} onSectorsChange={setSectors} zones={zones} userRole={currentUser.role} />;
      case "fat":
        return <FATScreen userRole={currentUser.role} fats={fats} onFatsChange={setFats} />;
      case "offres":
        return <OffresScreen groups={offreGroups} onGroupsChange={setOffreGroups} userRole={currentUser.role} />;
      case "users":
        return <UsersScreen currentUser={currentUser} users={users} onUsersChange={setUsers} zones={zones} sectors={sectors} />;
      case "settings":
        return <SettingsScreen config={config} onConfigChange={setConfig} userRole={currentUser.role} />;
      case "history":
        return <ActivityLogScreen logs={activityLogs} userRole={currentUser.role} />;
      default:
        return <DashboardScreen onNavigate={setCurrentScreen} userRole={currentUser.role} currentUser={currentUser} clients={clients} subscriptions={subscriptions} users={users} config={config} zones={zones} />;
    }
  };

  return (
    <AppShell
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      userRole={currentUser.role}
      userName={currentUser.name}
      isOnline={true}
      onLogout={handleLogout}
      clients={clients}
      subscriptions={subscriptions}
      currentUser={currentUser}
      users={users}
      darkMode={theme === "dark"}
      onToggleDark={toggleDark}
    >
      {renderScreen()}
    </AppShell>
  );
};

export default Index;
