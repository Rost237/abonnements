import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MapPin, Search, Pencil, Trash2 } from "lucide-react";

export interface FAT {
  id: string;
  nom: string;
  code: string;
  ville: string;
  quartier: string;
  localisation: string;
  description: string;
}

const emptyFAT: Omit<FAT, "id"> = { nom: "", code: "", ville: "", quartier: "", localisation: "", description: "" };

interface FATScreenProps {
  userRole: "admin" | "gerant" | "vendeur";
  fats: FAT[];
  onFatsChange: (fats: FAT[]) => void;
}

export default function FATScreen({ userRole, fats, onFatsChange }: FATScreenProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FAT | null>(null);
  const [form, setForm] = useState<Omit<FAT, "id">>(emptyFAT);

  const isAdmin = userRole === "admin";

  const filtered = fats.filter(f =>
    [f.nom, f.code, f.ville, f.quartier].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = () => {
    if (!form.nom || !form.code) return;
    if (editing) {
      onFatsChange(fats.map(f => f.id === editing.id ? { ...f, ...form } : f));
    } else {
      onFatsChange([...fats, { ...form, id: crypto.randomUUID() }]);
    }
    setForm(emptyFAT);
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (fat: FAT) => {
    setEditing(fat);
    setForm({ nom: fat.nom, code: fat.code, ville: fat.ville, quartier: fat.quartier, localisation: fat.localisation, description: fat.description });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    onFatsChange(fats.filter(f => f.id !== id));
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyFAT);
    setOpen(true);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground tracking-tight">FAT (Terminaux fibre)</h2>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="h-10 rounded-md gap-2"><Plus size={16} /> Nouveau FAT</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editing ? "Modifier le FAT" : "Nouveau FAT"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-foreground">Nom *</Label>
                    <Input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="FAT Akwa" className="h-10 rounded-md" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground">Code *</Label>
                    <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="FAT-001" className="h-10 rounded-md font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-foreground">Ville</Label>
                    <Input value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} placeholder="Douala" className="h-10 rounded-md" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground">Quartier</Label>
                    <Input value={form.quartier} onChange={e => setForm(f => ({ ...f, quartier: e.target.value }))} placeholder="Akwa" className="h-10 rounded-md" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground flex items-center gap-1.5"><MapPin size={14} /> Localisation (Maps)</Label>
                  <Input value={form.localisation} onChange={e => setForm(f => ({ ...f, localisation: e.target.value }))} placeholder="Lat, Lng ou lien Google Maps" className="h-10 rounded-md" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground">Description</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description du FAT..." className="rounded-md" rows={3} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 rounded-md" onClick={() => setOpen(false)}>Annuler</Button>
                  <Button className="flex-1 rounded-md" onClick={handleSave} disabled={!form.nom || !form.code}>{editing ? "Modifier" : "Créer"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un FAT..." className="pl-9 h-10 rounded-md" />
      </div>

      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="hidden sm:table-cell">Ville</TableHead>
              <TableHead className="hidden sm:table-cell">Quartier</TableHead>
              {isAdmin && <TableHead className="w-[80px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={isAdmin ? 5 : 4} className="text-center text-muted-foreground py-8">Aucun FAT trouvé</TableCell></TableRow>
            ) : filtered.map(f => (
              <TableRow key={f.id}>
                <TableCell className="font-mono font-medium text-foreground">{f.code}</TableCell>
                <TableCell className="font-medium text-foreground">{f.nom}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{f.ville}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{f.quartier}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(f)} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{fats.length} FAT(s) au total</p>
    </div>
  );
}
