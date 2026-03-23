import { useState, useRef, useEffect } from "react";
import { Search, X, User, Radio } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Client, Subscription } from "@/types";

interface GlobalSearchProps {
  clients: Client[];
  subscriptions: Subscription[];
  onNavigate: (screen: string) => void;
}

export default function GlobalSearch({ clients, subscriptions, onNavigate }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = query.toLowerCase().trim();
  const matchedClients = q ? clients.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 5) : [];
  const matchedSubs = q ? subscriptions.filter(s => s.clientName.toLowerCase().includes(q) || s.offreName.toLowerCase().includes(q)).slice(0, 5) : [];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground">
        <Search size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-popover border border-border rounded-lg shadow-elevated z-50">
          <div className="flex items-center gap-2 p-2 border-b border-border">
            <Search size={16} className="text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher clients, abonnements…"
              className="border-0 h-8 focus-visible:ring-0 bg-transparent"
            />
            {query && <button onClick={() => setQuery("")}><X size={14} className="text-muted-foreground" /></button>}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {matchedClients.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground px-3 pt-2 pb-1 font-semibold">Clients</p>
                {matchedClients.map(c => (
                  <button key={c.id} onClick={() => { onNavigate("clients"); setOpen(false); setQuery(""); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left">
                    <User size={14} className="text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.phone}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {matchedSubs.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground px-3 pt-2 pb-1 font-semibold">Abonnements</p>
                {matchedSubs.map(s => (
                  <button key={s.id} onClick={() => { onNavigate("subscriptions"); setOpen(false); setQuery(""); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left">
                    <Radio size={14} className="text-warning" />
                    <div>
                      <p className="font-medium text-foreground">{s.clientName}</p>
                      <p className="text-xs text-muted-foreground">{s.offreName} — {s.groupName}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {q && matchedClients.length === 0 && matchedSubs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun résultat</p>
            )}
            {!q && <p className="text-sm text-muted-foreground text-center py-4">Tapez pour rechercher…</p>}
          </div>
        </div>
      )}
    </div>
  );
}
