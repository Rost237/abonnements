import { useState } from "react";
import GoalRing from "@/components/GoalRing";
import { motion } from "framer-motion";
import { Users, Radio, TrendingUp, Clock, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Subscription, AppUser, Client, UserRole, CompanyConfig } from "@/types";

type PeriodFilter = "today" | "week" | "month" | "year" | "all";

function filterByPeriod(subs: Subscription[], period: PeriodFilter): Subscription[] {
  if (period === "all") return subs;
  const now = new Date();
  const start = new Date();
  if (period === "today") start.setHours(0, 0, 0, 0);
  else if (period === "week") start.setDate(now.getDate() - 7);
  else if (period === "month") start.setMonth(now.getMonth(), 1);
  else if (period === "year") start.setFullYear(now.getFullYear(), 0, 1);
  return subs.filter(s => new Date(s.date) >= start);
}

function getPreviousPeriodSubs(subs: Subscription[], period: PeriodFilter): Subscription[] {
  if (period === "all" || period === "today") return [];
  const now = new Date();
  let start: Date, end: Date;
  if (period === "week") {
    end = new Date(now.getTime() - 7 * 86400000);
    start = new Date(end.getTime() - 7 * 86400000);
  } else if (period === "month") {
    end = new Date(now.getFullYear(), now.getMonth(), 1);
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  } else {
    end = new Date(now.getFullYear(), 0, 1);
    start = new Date(now.getFullYear() - 1, 0, 1);
  }
  return subs.filter(s => { const d = new Date(s.date); return d >= start && d < end; });
}

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
  userRole: UserRole;
  currentUser: AppUser;
  clients: Client[];
  subscriptions: Subscription[];
  users: AppUser[];
  config: CompanyConfig;
}

export default function DashboardScreen({ onNavigate, userRole, currentUser, clients, subscriptions, users, config }: DashboardScreenProps) {
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const devise = config.devise || "FCFA";
  const formatCurrency = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " " + devise;

  const isVendeur = userRole === "vendeur";
  const allRelevant = isVendeur ? subscriptions.filter(s => s.vendeurId === currentUser.id) : subscriptions;
  const relevantSubs = filterByPeriod(allRelevant, period);
  const prevSubs = getPreviousPeriodSubs(allRelevant, period);

  const activeClients = clients.filter(c => c.status === "actif").length;
  const caTotal = relevantSubs.reduce((sum, s) => sum + s.total, 0);
  const caPrev = prevSubs.reduce((sum, s) => sum + s.total, 0);
  const objectif = currentUser.objectifMensuel || 500000;

  const caChange = caPrev > 0 ? ((caTotal - caPrev) / caPrev) * 100 : 0;
  const subsChange = prevSubs.length > 0 ? ((relevantSubs.length - prevSubs.length) / prevSubs.length) * 100 : 0;

  const vendeurs = users.filter(u => u.role === "vendeur");
  const caByVendeur = vendeurs.map(v => ({
    name: v.name,
    ca: filterByPeriod(subscriptions.filter(s => s.vendeurId === v.id), period).reduce((sum, s) => sum + s.total, 0),
    objectif: v.objectifMensuel,
  }));

  const stats = [
    { label: "Clients actifs", value: String(activeClients), icon: Users, color: "text-success", change: null },
    { label: "Abonnements", value: String(relevantSubs.length), icon: Radio, color: "text-primary", change: subsChange },
    { label: isVendeur ? "Mon CA" : "CA global", value: formatCurrency(caTotal), icon: TrendingUp, color: "text-warning", change: caChange },
  ];

  const recentSubs = [...relevantSubs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const periodLabels: Record<PeriodFilter, string> = { today: "Aujourd'hui", week: "Cette semaine", month: "Ce mois", year: "Cette année", all: "Tout" };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Tableau de bord</h2>
        <Select value={period} onValueChange={v => setPeriod(v as PeriodFilter)}>
          <SelectTrigger className="h-9 w-40 rounded-md text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(Object.keys(periodLabels) as PeriodFilter[]).map(p => (
              <SelectItem key={p} value={p}>{periodLabels[p]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-lg shadow-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={16} className={s.color} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-lg font-bold tabular-nums text-foreground truncate">{s.value}</p>
            {s.change !== null && s.change !== 0 && (
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${s.change > 0 ? "text-success" : "text-destructive"}`}>
                {s.change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(Math.round(s.change))}% vs précédent
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="bg-card rounded-lg shadow-card p-6">
        <GoalRing current={caTotal} target={objectif} />
        <div className="text-center mt-3 space-y-1">
          <p className="text-sm font-semibold text-foreground tabular-nums">{formatCurrency(caTotal)} / {formatCurrency(objectif)}</p>
          <p className="text-xs text-muted-foreground">
            {caTotal >= objectif ? "🎉 Objectif atteint !" : `Reste ${formatCurrency(objectif - caTotal)} pour atteindre l'objectif`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => onNavigate("clients")} variant="outline" className="h-14 rounded-md gap-2 font-semibold"><Plus size={18} /> Nouveau Client</Button>
        <Button onClick={() => onNavigate("subscriptions")} className="h-14 rounded-md gap-2 font-semibold"><Plus size={18} /> Nouvel Abonnement</Button>
      </div>

      {(userRole === "admin" || userRole === "coadmin") && vendeurs.length > 0 && (
        <div className="bg-card rounded-lg shadow-card">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">CA par vendeur</h3>
          </div>
          <div className="divide-y divide-border">
            {caByVendeur.map(v => (
              <div key={v.name} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{v.name}</p>
                  {v.objectif > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (v.ca / v.objectif) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{Math.round((v.ca / v.objectif) * 100)}%</span>
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold tabular-nums text-foreground">{formatCurrency(v.ca)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-card">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Activité récente</h3>
        </div>
        {recentSubs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucune activité</p>
        ) : (
          <ul>
            {recentSubs.map(s => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.clientName}</p>
                  <p className="text-xs text-muted-foreground">{s.groupName} — {s.offreName} · {s.duration} mois</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-foreground">{formatCurrency(s.total)}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Clock size={10} />{new Date(s.date).toLocaleDateString("fr-FR")}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
