import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import type { Sector, Zone, UserRole } from "@/types";

interface SectorsScreenProps {
  sectors: Sector[];
  onSectorsChange: (sectors: Sector[]) => void;
  zones: Zone[];
  userRole: UserRole;
}

const emptyForm = { nom: "", code: "", zoneId: "" };

export default function SectorsScreen({ sectors, onSectorsChange, zones, userRole }: SectorsScreenProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Sector | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Everyone can create sectors
  const canEdit = userRole === "admin" || userRole === "coadmin";
  const canDelete = userRole === "admin" || userRole === "coadmin";

  const filtered = sectors.filter(s =>
    [s.nom, s.code].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  const getZoneName = (zoneId: string) => zones.find(z => z.id === zoneId)?.nom || "—";

  const handleSave = () => {
    if (!form.nom || !form.code || !form.zoneId) return;
    if (editing) {
      onSectorsChange(sectors.map(s => s.id === editing.id ? { ...s, ...form } : s));
    } else {
      onSectorsChange([...sectors, { ...form, id: crypto.randomUUID() }]);
    }
    setForm(emptyForm);
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (sector: Sector) => {
    setEditing(sector);
    setForm({ nom: sector.nom, code: sector.code, zoneId: sector.zoneId });
    setOpen(true);
  };

  const handleDelete = (id: string) => onSectorsChange(sectors.filter(s => s.id !== id));
  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Secteurs</h2>
        <Button onClick={openNew} className="h-10 rounded-md gap-2"><Plus size={16} /> Nouveau secteur</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editing ? "Modifier le secteur" : "Nouveau secteur"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-foreground">Nom *</Label>
                <Input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Secteur A" className="h-10 rounded-md" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground">Code *</Label>
                <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="SEC-001" className="h-10 rounded-md font-mono" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground">Zone *</Label>
              <Select value={form.zoneId} onValueChange={v => setForm(f => ({ ...f, zoneId: v }))}>
                <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Choisir une zone" /></SelectTrigger>
                <SelectContent>{zones.map(z => <SelectItem key={z.id} value={z.id}>{z.nom}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-md" onClick={() => setOpen(false)}>Annuler</Button>
              <Button className="flex-1 rounded-md" onClick={handleSave} disabled={!form.nom || !form.code || !form.zoneId}>{editing ? "Modifier" : "Créer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un secteur..." className="pl-9 h-10 rounded-md" />
      </div>

      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Aucun secteur</TableCell></TableRow>
            ) : filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-mono font-medium text-foreground">{s.code}</TableCell>
                <TableCell className="font-medium text-foreground">{s.nom}</TableCell>
                <TableCell className="text-muted-foreground">{getZoneName(s.zoneId)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {canEdit && <button onClick={() => handleEdit(s)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>}
                    {canDelete && <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{sectors.length} secteur(s) au total</p>
    </div>
  );
}
