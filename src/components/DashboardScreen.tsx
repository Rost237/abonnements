import GoalRing from "@/components/GoalRing";
import { motion } from "framer-motion";
import { Plus, Users, Radio, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
  userRole: "admin" | "gerant" | "vendeur";
}

const recentActivity = [
  { client: "Jean Mbarga", action: "Abonnement Medium", amount: "15 000 FCFA", time: "Il y a 2h" },
  { client: "Marie Fotso", action: "Abonnement Small", amount: "10 000 FCFA", time: "Il y a 5h" },
  { client: "Paul Ndjock", action: "Abonnement Large", amount: "25 000 FCFA", time: "Hier" },
];

const stats = [
  { label: "Clients actifs", value: "124", icon: Users, color: "text-success" },
  { label: "Abonnements", value: "98", icon: Radio, color: "text-primary" },
  { label: "CA du mois", value: "1.2M", icon: TrendingUp, color: "text-warning" },
];

export default function DashboardScreen({ onNavigate, userRole }: DashboardScreenProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-xl font-bold text-foreground tracking-tight">Tableau de bord</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-lg shadow-card p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={16} className={s.color} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-foreground">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Goal Ring */}
      <div className="bg-card rounded-lg shadow-card p-6">
        <GoalRing current={375000} target={500000} />
        <div className="text-center mt-3 space-y-1">
          <p className="text-sm font-semibold text-foreground tabular-nums">375 000 / 500 000 FCFA</p>
          <p className="text-xs text-muted-foreground">Reste 125 000 FCFA pour atteindre l'objectif</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => onNavigate("clients")} variant="outline" className="h-14 rounded-md gap-2 font-semibold">
          <Plus size={18} /> Nouveau Client
        </Button>
        <Button onClick={() => onNavigate("subscriptions")} className="h-14 rounded-md gap-2 font-semibold">
          <Plus size={18} /> Nouvel Abonnement
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-lg shadow-card">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Activité récente</h3>
        </div>
        <ul>
          {recentActivity.map((a, i) => (
            <li key={i} className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors duration-150 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{a.client}</p>
                <p className="text-xs text-muted-foreground">{a.action}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums text-foreground">{a.amount}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Clock size={10} />{a.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
