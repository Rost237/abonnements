import { useState } from "react";
import { Bell, X, AlertTriangle, Target, Clock } from "lucide-react";
import type { Subscription, AppUser } from "@/types";

interface Notification {
  id: string;
  type: "expiration" | "objectif" | "relance";
  title: string;
  message: string;
  date: string;
}

interface NotificationsPanelProps {
  subscriptions: Subscription[];
  currentUser: AppUser;
  users: AppUser[];
}

function generateNotifications(subs: Subscription[], currentUser: AppUser, users: AppUser[]): Notification[] {
  const notifs: Notification[] = [];
  const now = new Date();

  // Expiration alerts (5 days before)
  subs.forEach(s => {
    if (!s.dateFin) return;
    const fin = new Date(s.dateFin);
    const diff = Math.ceil((fin.getTime() - now.getTime()) / 86400000);
    if (diff > 0 && diff <= 5) {
      notifs.push({
        id: `exp-${s.id}`,
        type: "expiration",
        title: "Expiration imminente",
        message: `L'abonnement de ${s.clientName} expire dans ${diff} jour${diff > 1 ? "s" : ""}`,
        date: s.dateFin,
      });
    }
  });

  // Objectif alerts for vendeurs
  if (currentUser.role === "admin" || currentUser.role === "coadmin") {
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    users.filter(u => u.role === "vendeur" && u.objectifMensuel > 0).forEach(v => {
      const ca = subs.filter(s => s.vendeurId === v.id && new Date(s.date) >= thisMonth).reduce((sum, s) => sum + s.total, 0);
      const pct = Math.round((ca / v.objectifMensuel) * 100);
      if (pct < 50) {
        notifs.push({
          id: `obj-${v.id}`,
          type: "objectif",
          title: "Objectif en retard",
          message: `${v.name} est à ${pct}% de son objectif mensuel`,
          date: now.toISOString(),
        });
      }
    });
  }

  // Clients à relancer (abonnement expiré depuis > 7 jours)
  subs.forEach(s => {
    if (!s.dateFin) return;
    const fin = new Date(s.dateFin);
    const diff = Math.ceil((now.getTime() - fin.getTime()) / 86400000);
    if (diff > 7 && diff <= 30) {
      notifs.push({
        id: `rel-${s.id}`,
        type: "relance",
        title: "Client à relancer",
        message: `${s.clientName} — abonnement expiré depuis ${diff} jours`,
        date: s.dateFin,
      });
    }
  });

  return notifs.slice(0, 20);
}

export default function NotificationsPanel({ subscriptions, currentUser, users }: NotificationsPanelProps) {
  const [open, setOpen] = useState(false);
  const notifs = generateNotifications(subscriptions, currentUser, users);
  const count = notifs.length;

  const iconMap = { expiration: AlertTriangle, objectif: Target, relance: Clock };
  const colorMap = { expiration: "text-warning", objectif: "text-destructive", relance: "text-primary" };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground relative">
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-popover border border-border rounded-lg shadow-elevated z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <button onClick={() => setOpen(false)}><X size={14} className="text-muted-foreground" /></button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune notification</p>
            ) : (
              notifs.map(n => {
                const Icon = iconMap[n.type];
                return (
                  <div key={n.id} className="flex items-start gap-2 px-3 py-2.5 border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <Icon size={16} className={`mt-0.5 ${colorMap[n.type]}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
