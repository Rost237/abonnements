import { useState } from "react";
import { Clock, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ActivityLog, UserRole } from "@/types";

interface ActivityLogScreenProps {
  logs: ActivityLog[];
  userRole: UserRole;
}

const actionLabels: Record<string, string> = { create: "Création", update: "Modification", delete: "Suppression" };
const actionColors: Record<string, string> = { create: "bg-success/10 text-success", update: "bg-warning/10 text-warning", delete: "bg-destructive/10 text-destructive" };

export default function ActivityLogScreen({ logs, userRole }: ActivityLogScreenProps) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (userRole === "vendeur") {
    return (
      <div className="space-y-4 max-w-lg">
        <h2 className="text-xl font-bold text-foreground">Historique</h2>
        <p className="text-sm text-muted-foreground">Accès réservé aux administrateurs et gérants.</p>
      </div>
    );
  }

  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filtered = sorted.filter(l =>
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.entityLabel.toLowerCase().includes(search.toLowerCase()) ||
    l.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-3xl">
      <h2 className="text-xl font-bold text-foreground tracking-tight">Historique des actions</h2>

      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par utilisateur ou entité..." className="h-10 rounded-md" />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucune action enregistrée</p>
      ) : (
        <div className="bg-card rounded-lg shadow-card divide-y divide-border">
          {filtered.map(log => {
            const expanded = expandedId === log.id;
            let beforeObj: Record<string, unknown> | null = null;
            let afterObj: Record<string, unknown> | null = null;
            try { if (log.before) beforeObj = JSON.parse(log.before); } catch {}
            try { if (log.after) afterObj = JSON.parse(log.after); } catch {}

            const changes: { key: string; before: string; after: string }[] = [];
            if (beforeObj && afterObj) {
              const allKeys = new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]);
              allKeys.forEach(k => {
                if (k === "id" || k === "password") return;
                const bv = String(beforeObj![k] ?? "—");
                const av = String(afterObj![k] ?? "—");
                if (bv !== av) changes.push({ key: k, before: bv, after: av });
              });
            }

            return (
              <div key={log.id} className="px-4 py-3">
                <button className="flex items-start gap-3 w-full text-left" onClick={() => setExpandedId(expanded ? null : log.id)}>
                  <div className="mt-0.5">
                    {expanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{log.userName}</span>
                      <Badge className={`text-[10px] px-1.5 py-0 ${actionColors[log.action] || "bg-muted text-muted-foreground"}`}>{actionLabels[log.action] || log.action}</Badge>
                      <span className="text-xs text-muted-foreground">{log.entity}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.entityLabel}</p>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock size={10} />
                    {new Date(log.date).toLocaleDateString("fr-FR")} {new Date(log.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </button>

                {expanded && changes.length > 0 && (
                  <div className="mt-3 ml-7 bg-muted rounded-md p-3 space-y-2">
                    <p className="text-xs font-semibold text-foreground mb-1">Modifications</p>
                    {changes.map(c => (
                      <div key={c.key} className="text-xs grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground font-medium">{c.key}</span>
                        <span className="text-destructive line-through truncate">{c.before}</span>
                        <span className="text-success truncate">{c.after}</span>
                      </div>
                    ))}
                  </div>
                )}
                {expanded && log.action === "create" && afterObj && (
                  <div className="mt-3 ml-7 bg-muted rounded-md p-3 space-y-1">
                    <p className="text-xs font-semibold text-foreground mb-1">Données créées</p>
                    {Object.entries(afterObj).filter(([k]) => k !== "id" && k !== "password").map(([k, v]) => (
                      <div key={k} className="text-xs flex gap-2">
                        <span className="text-muted-foreground font-medium w-24 shrink-0">{k}</span>
                        <span className="text-foreground truncate">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
