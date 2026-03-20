import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MapPin, Search, Pencil, Trash2 } from "lucide-react";
import type { Zone, UserRole } from "@/types";

const emptyZone: Omit<Zone, "id"> = { nom: "", code: "", ville: "", quartier: "", localisation: "", description: "" };

interface ZonesScreenProps {
  userRole: UserRole;
  zones: Zone[];
  onZonesChange: (zones: Zone[]) => void;
}

export default function ZonesScreen({ userRole, zones, onZonesChange }: ZonesScreenProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Zone | null>(null);
  const [form, setForm] = useState<Omit<Zone, "id">>(emptyZone);

  const isAdmin = userRole === "admin" || userRole === "coadmin";

  const filtered = zones.filter(z =>
    [z.nom, z.code, z.ville, z.quartier].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = () => {
    if (!form.nom || !form.code) return;
    if (editing) {
      onZonesChange(zones.map(z => z.id === editing.id ? { ...z, ...form } : z));
    } else {
      onZonesChange([...zones, { ...form, id: crypto.randomUUID() }]);
    }
    setForm(emptyZone);
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (zone: Zone) => {
    setEditing(zone);
    setForm({ nom: zone.nom, code: zone.code, ville: zone.ville, quartier: zone.quartier, localisation: zone.localisation, description: zone.description });
    setOpen(true);
  };

  const handleDelete = (id: string) => onZonesChange(zones.filter(z => z.id !== id));
  const openNew = () => { setEditing(null); setForm(emptyZone); setOpen(true); };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Zones</h2>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="h-10 rounded-md gap-2"><Plus size={16} /> Nouvelle zone</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>{editing ? "Modifier la zone" : "Nouvelle zone"}</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-foreground">Nom *</Label><Input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Zone Nord" className="h-10 rounded-md" /></div>
                  <div className="space-y-1.5"><Label className="text-foreground">Code *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="ZN-001" className="h-10 rounded-md font-mono" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-foreground">Ville</Label><Input value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} placeholder="Douala" className="h-10 rounded-md" /></div>
                  <div className="space-y-1.5"><Label className="text-foreground">Quartier</Label><Input value={form.quartier} onChange={e => setForm(f => ({ ...f, quartier: e.target.value }))} placeholder="Akwa" className="h-10 rounded-md" /></div>
                </div>
                <div className="space-y-1.5"><Label className="text-foreground flex items-center gap-1.5"><MapPin size={14} /> Localisation (Maps)</Label><Input value={form.localisation} onChange={e => setForm(f => ({ ...f, localisation: e.target.value }))} placeholder="Lat, Lng ou lien Google Maps" className="h-10 rounded-md" /></div>
                <div className="space-y-1.5"><Label className="text-foreground">Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description..." className="rounded-md" rows={3} /></div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 rounded-md" onClick={() => setOpen(false)}>Annuler</Button>
                  <Button className="flex-1 rounded-md" onClick={handleSave} disabled={!form.nom || !form.code}>{editing ? "Modifier" : "Créer"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9 h-10 rounded-md" /></div>
      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Nom</TableHead><TableHead className="hidden sm:table-cell">Ville</TableHead><TableHead className="hidden sm:table-cell">Quartier</TableHead>{isAdmin && <TableHead className="w-[80px]">Actions</TableHead>}</TableRow></TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={isAdmin ? 5 : 4} className="text-center text-muted-foreground py-8">Aucune zone</TableCell></TableRow>
            ) : filtered.map(z => (
              <TableRow key={z.id}>
                <TableCell className="font-mono font-medium text-foreground">{z.code}</TableCell>
                <TableCell className="font-medium text-foreground">{z.nom}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{z.ville}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{z.quartier}</TableCell>
                {isAdmin && <TableCell><div className="flex gap-1"><button onClick={() => handleEdit(z)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Pencil size={14} /></button><button onClick={() => handleDelete(z.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button></div></TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{zones.length} zone(s)</p>
    </div>
  );
}
