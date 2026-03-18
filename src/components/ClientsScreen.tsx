import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const demoClients = [
  { id: 1, name: "Jean Mbarga", phone: "699 123 456", email: "jean@mail.com", zone: "Zone A", status: "actif" as const },
  { id: 2, name: "Marie Fotso", phone: "677 234 567", email: "marie@mail.com", zone: "Zone B", status: "actif" as const },
  { id: 3, name: "Paul Ndjock", phone: "655 345 678", email: "", zone: "Zone A", status: "prospect" as const },
  { id: 4, name: "Sophie Ateba", phone: "690 456 789", email: "sophie@mail.com", zone: "Zone C", status: "inactif" as const },
  { id: 5, name: "Alain Tchio", phone: "670 567 890", email: "", zone: "Zone B", status: "actif" as const },
];

const statusConfig = {
  actif: { label: "Actif", className: "bg-success/15 text-success border-success/30" },
  prospect: { label: "Prospect", className: "bg-warning/15 text-warning border-warning/30" },
  inactif: { label: "Inactif", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

export default function ClientsScreen() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "actif" | "prospect" | "inactif">("all");

  const filtered = demoClients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Clients</h2>
        <Button size="sm" className="rounded-md gap-1.5 font-semibold"><Plus size={16} /> Ajouter</Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client..." className="pl-9 h-10 rounded-md" />
      </div>

      <div className="flex gap-2">
        {(["all", "actif", "prospect", "inactif"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground hover:bg-accent/80"}`}
          >
            {f === "all" ? "Tous" : statusConfig[f].label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-lg shadow-card divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">Aucun client trouvé</p>
            <Button size="sm" className="rounded-md gap-1.5"><Plus size={16} /> Créer un client</Button>
          </div>
        ) : (
          filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors duration-150 cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1"><Phone size={10} />{c.phone}</span>
                  <span>{c.zone}</span>
                </div>
              </div>
              <Badge variant="outline" className={statusConfig[c.status].className + " text-xs"}>
                {statusConfig[c.status].label}
              </Badge>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
