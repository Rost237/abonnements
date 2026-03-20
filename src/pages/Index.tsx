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
import type { AppUser, Client, Zone, FAT, Sector, OffreGroup, Subscription, CompanyConfig } from "@/types";

const adminUser: AppUser = {
  id: "admin-root",
  login: "admin",
  password: "admin",
  role: "admin",
  name: "Administrateur",
  mustChangePassword: false,
  zones: [],
  secteurs: [],
  objectifMensuel: 0,
};

const defaultConfig: CompanyConfig = {
  nom: "", sigle: "", regime: "", capital: "", rccm: "", compteBancaire: "",
  localisation: "", contacts: "", siteWeb: "", boitePostale: "",
  devise: "FCFA",
  modesPaiement: ["Espèces", "Mobile Money", "Virement bancaire"],
};

const Index = () => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [users, setUsers] = useState<AppUser[]>([adminUser]);
  const [offreGroups, setOffreGroups] = useState<OffreGroup[]>(defaultOffreGroups);
  const [clients, setClients] = useState<Client[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [fats, setFats] = useState<FAT[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [config, setConfig] = useState<CompanyConfig>(defaultConfig);

  const handleLogin = (user: AppUser) => setCurrentUser(user);
  const handleChangePassword = (userId: string, newPassword: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword, mustChangePassword: false } : u));
  };
  const handleLogout = () => { setCurrentUser(null); setCurrentScreen("dashboard"); };

  if (!currentUser) {
    return <LoginScreen users={users} onLogin={handleLogin} onChangePassword={handleChangePassword} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <DashboardScreen onNavigate={setCurrentScreen} userRole={currentUser.role} currentUser={currentUser} clients={clients} subscriptions={subscriptions} users={users} config={config} />;
      case "clients":
        return <ClientsScreen userRole={currentUser.role} clients={clients} onClientsChange={setClients} zones={zones} sectors={sectors} />;
      case "subscriptions":
        return <SubscriptionScreen offreGroups={offreGroups} userRole={currentUser.role} currentUser={currentUser} clients={clients} onClientsChange={setClients} zones={zones} sectors={sectors} fats={fats} users={users} subscriptions={subscriptions} onSubscriptionsChange={setSubscriptions} config={config} />;
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
      default:
        return <DashboardScreen onNavigate={setCurrentScreen} userRole={currentUser.role} currentUser={currentUser} clients={clients} subscriptions={subscriptions} users={users} config={config} />;
    }
  };

  return (
    <AppShell currentScreen={currentScreen} onNavigate={setCurrentScreen} userRole={currentUser.role} userName={currentUser.name} isOnline={true} onLogout={handleLogout}>
      {renderScreen()}
    </AppShell>
  );
};

export default Index;
