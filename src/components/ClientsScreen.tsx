import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Phone, Mail, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  zone: string;
  status: "actif" | "prospect" | "inactif";
}

const statusConfig = {
  actif: { label: "Actif", className: "bg-success/15 text-success border-success/30" },
  prospect: { label: "Prospect", className: "bg-warning/15 text-warning border-warning/30" },
  inactif: { label: "Inactif", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

const emptyForm = { name: "", phone: "", email: "", zone: "", status: "prospect" as const };

interface ClientsScreenProps {
  userRole: "admin" | "gerant" | "vendeur";
  clients: Client[];
  onClientsChange: (clients: Client[]) => void;
}

export default function ClientsScreen({ userRole, clients, onClientsChange }: ClientsScreenProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "actif" | "prospect" | "inactif">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);

  const canCreate = userRole === "admin" || userRole === "vendeur";
  const canEdit = userRole === "admin";
  const canDelete = userRole === "admin";

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  const handleSave = () => {
    if (!form.name || !form.phone) return;
    if (editing) {
      onClientsChange(clients.map(c => c.id === editing.id ? { ...c, ...form } : c));
    } else {
      onClientsChange([...clients, { ...form, id: crypto.randomUUID() }]);
    }
    setForm(emptyForm);
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (client: Client) => {
    setEditing(client);
    setForm({ name: client.name, phone: client.phone, email: client.email, zone: client.zone, status: client.status });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    onClientsChange(clients.filter(c => c.id !== id));
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Clients</h2>
        {canCreate && (
          <Button size="sm" className="rounded-md gap-1.5 font-semibold" onClick={openNew}>
            <Plus size={16} /> Ajouter
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier le client" : "Nouveau client"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-foreground">Nom complet *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jean Dupont" className="h-10 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-foreground">Téléphone *</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="6XX XXX XXX" className="h-10 rounded-md" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground">Email</Label>
                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemple.com" className="h-10 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-foreground">Zone / Secteur</Label>
                <Input value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))} placeholder="Zone Nord" className="h-10 rounded-md" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground">Statut</Label>
                <Select value={form.status} onValueChange={(v: "actif" | "prospect" | "inactif") => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="h-10 rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-md" onClick={() => setOpen(false)}>Annuler</Button>
              <Button className="flex-1 rounded-md" onClick={handleSave} disabled={!form.name || !form.phone}>
                {editing ? "Modifier" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
            {canCreate && (
              <Button size="sm" className="rounded-md gap-1.5" onClick={openNew}><Plus size={16} /> Créer un client</Button>
            )}
          </div>
        ) : (
          filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors duration-150"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1"><Phone size={10} />{c.phone}</span>
                  <span>{c.zone}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={statusConfig[c.status].className + " text-xs"}>
                  {statusConfig[c.status].label}
                </Badge>
                {canEdit && (
                  <button onClick={() => handleEdit(c)} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                )}
                {canDelete && (
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
      <p className="text-xs text-muted-foreground">{clients.length} client(s) au total</p>
    </div>
  );
}
