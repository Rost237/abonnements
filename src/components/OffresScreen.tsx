import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

export interface Offre {
  id: string;
  name: string;
  price: number;
}

const defaultOffres: Offre[] = [
  { id: "1", name: "Small", price: 10000 },
  { id: "2", name: "Medium", price: 15000 },
  { id: "3", name: "Large", price: 25000 },
  { id: "4", name: "Extreme", price: 35000 },
];

interface OffresScreenProps {
  offres: Offre[];
  onOffresChange: (offres: Offre[]) => void;
}

const emptyForm = { name: "", price: 0 };

export { defaultOffres };

export default function OffresScreen({ offres, onOffresChange }: OffresScreenProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Offre | null>(null);
  const [form, setForm] = useState<{ name: string; price: number }>(emptyForm);

  const formatCurrency = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

  const filtered = offres.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.name || form.price <= 0) return;
    if (editing) {
      onOffresChange(offres.map(o => o.id === editing.id ? { ...o, ...form } : o));
    } else {
      onOffresChange([...offres, { ...form, id: crypto.randomUUID() }]);
    }
    setForm(emptyForm);
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (offre: Offre) => {
    setEditing(offre);
    setForm({ name: offre.name, price: offre.price });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    onOffresChange(offres.filter(o => o.id !== id));
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Offres</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="h-10 rounded-md gap-2"><Plus size={16} /> Nouvelle offre</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier l'offre" : "Nouvelle offre"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-foreground">Nom *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Premium" className="h-10 rounded-md" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground">Prix mensuel (FCFA) *</Label>
                <Input type="number" value={form.price || ""} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} placeholder="15000" className="h-10 rounded-md" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 rounded-md" onClick={() => setOpen(false)}>Annuler</Button>
                <Button className="flex-1 rounded-md" onClick={handleSave} disabled={!form.name || form.price <= 0}>{editing ? "Modifier" : "Créer"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une offre..." className="pl-9 h-10 rounded-md" />
      </div>

      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Prix mensuel</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">Aucune offre trouvée</TableCell></TableRow>
            ) : filtered.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-medium text-foreground">{o.name}</TableCell>
                <TableCell className="tabular-nums text-foreground">{formatCurrency(o.price)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(o)} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(o.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{offres.length} offre(s) au total</p>
    </div>
  );
}
