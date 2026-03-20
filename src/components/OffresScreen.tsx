import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, FolderPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { OffreGroup, Offre, UserRole } from "@/types";

const defaultOffreGroups: OffreGroup[] = [
  {
    id: "grp-1",
    name: "Internet illimité",
    offres: [
      { id: "1", groupId: "grp-1", name: "Small (S)", price: 10000 },
      { id: "2", groupId: "grp-1", name: "Medium (M)", price: 15000 },
      { id: "3", groupId: "grp-1", name: "Large (L)", price: 25000 },
      { id: "4", groupId: "grp-1", name: "Extreme (X)", price: 35000 },
    ],
  },
];

export { defaultOffreGroups };

interface OffresScreenProps {
  groups: OffreGroup[];
  onGroupsChange: (groups: OffreGroup[]) => void;
  userRole: UserRole;
}

export default function OffresScreen({ groups, onGroupsChange, userRole }: OffresScreenProps) {
  const [search, setSearch] = useState("");
  const [openOffre, setOpenOffre] = useState(false);
  const [openGroup, setOpenGroup] = useState(false);
  const [editingOffre, setEditingOffre] = useState<Offre | null>(null);
  const [editingGroup, setEditingGroup] = useState<OffreGroup | null>(null);
  const [offreForm, setOffreForm] = useState({ name: "", price: 0, groupId: "" });
  const [groupForm, setGroupForm] = useState({ name: "" });

  const isAdmin = userRole === "admin" || userRole === "coadmin";
  const formatCurrency = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
  const allOffres = groups.flatMap(g => g.offres.map(o => ({ ...o, groupName: g.name })));
  const filtered = allOffres.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || o.groupName.toLowerCase().includes(search.toLowerCase()));

  const handleSaveOffre = () => {
    if (!offreForm.name || offreForm.price <= 0 || !offreForm.groupId) return;
    if (editingOffre) {
      onGroupsChange(groups.map(g => ({
        ...g,
        offres: g.offres.map(o => o.id === editingOffre.id ? { ...o, name: offreForm.name, price: offreForm.price, groupId: offreForm.groupId } : o)
      })));
    } else {
      const newOffre: Offre = { id: crypto.randomUUID(), groupId: offreForm.groupId, name: offreForm.name, price: offreForm.price };
      onGroupsChange(groups.map(g => g.id === offreForm.groupId ? { ...g, offres: [...g.offres, newOffre] } : g));
    }
    setOffreForm({ name: "", price: 0, groupId: "" });
    setEditingOffre(null);
    setOpenOffre(false);
  };

  const handleSaveGroup = () => {
    if (!groupForm.name) return;
    if (editingGroup) {
      onGroupsChange(groups.map(g => g.id === editingGroup.id ? { ...g, name: groupForm.name } : g));
    } else {
      onGroupsChange([...groups, { id: crypto.randomUUID(), name: groupForm.name, offres: [] }]);
    }
    setGroupForm({ name: "" });
    setEditingGroup(null);
    setOpenGroup(false);
  };

  const handleEditOffre = (offre: Offre & { groupName: string }) => {
    setEditingOffre(offre);
    setOffreForm({ name: offre.name, price: offre.price, groupId: offre.groupId });
    setOpenOffre(true);
  };

  const handleDeleteOffre = (offreId: string) => {
    onGroupsChange(groups.map(g => ({ ...g, offres: g.offres.filter(o => o.id !== offreId) })));
  };

  const handleDeleteGroup = (groupId: string) => {
    onGroupsChange(groups.filter(g => g.id !== groupId));
  };

  const openNewOffre = () => { setEditingOffre(null); setOffreForm({ name: "", price: 0, groupId: groups[0]?.id || "" }); setOpenOffre(true); };
  const openNewGroup = () => { setEditingGroup(null); setGroupForm({ name: "" }); setOpenGroup(true); };

  if (!isAdmin) {
    return (
      <div className="space-y-4 max-w-lg">
        <h2 className="text-xl font-bold text-foreground">Offres</h2>
        <p className="text-sm text-muted-foreground">Seul l'administrateur peut gérer les offres.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Offres</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openNewGroup} className="h-10 rounded-md gap-2"><FolderPlus size={16} /> Nouveau groupe</Button>
          <Button onClick={openNewOffre} className="h-10 rounded-md gap-2" disabled={groups.length === 0}><Plus size={16} /> Nouvelle offre</Button>
        </div>
      </div>

      {/* Group Dialog */}
      <Dialog open={openGroup} onOpenChange={setOpenGroup}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editingGroup ? "Modifier le groupe" : "Nouveau groupe d'offres"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-foreground">Nom du groupe *</Label>
              <Input value={groupForm.name} onChange={e => setGroupForm({ name: e.target.value })} placeholder="Ex: Internet illimité" className="h-10 rounded-md" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-md" onClick={() => setOpenGroup(false)}>Annuler</Button>
              <Button className="flex-1 rounded-md" onClick={handleSaveGroup} disabled={!groupForm.name}>{editingGroup ? "Modifier" : "Créer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Offre Dialog */}
      <Dialog open={openOffre} onOpenChange={setOpenOffre}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editingOffre ? "Modifier l'offre" : "Nouvelle offre"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-foreground">Groupe *</Label>
              <Select value={offreForm.groupId} onValueChange={v => setOffreForm(f => ({ ...f, groupId: v }))}>
                <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Choisir un groupe" /></SelectTrigger>
                <SelectContent>{groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground">Nom *</Label>
              <Input value={offreForm.name} onChange={e => setOffreForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Premium" className="h-10 rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground">Prix mensuel (FCFA) *</Label>
              <Input type="number" value={offreForm.price || ""} onChange={e => setOffreForm(f => ({ ...f, price: Number(e.target.value) }))} placeholder="15000" className="h-10 rounded-md" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-md" onClick={() => setOpenOffre(false)}>Annuler</Button>
              <Button className="flex-1 rounded-md" onClick={handleSaveOffre} disabled={!offreForm.name || offreForm.price <= 0 || !offreForm.groupId}>{editingOffre ? "Modifier" : "Créer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une offre..." className="pl-9 h-10 rounded-md" />
      </div>

      {/* Groups list */}
      {groups.map(group => (
        <div key={group.id} className="bg-card rounded-lg shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{group.name}</h3>
              <Badge variant="outline" className="text-xs text-muted-foreground">{group.offres.length} offre(s)</Badge>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditingGroup(group); setGroupForm({ name: group.name }); setOpenGroup(true); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
              <button onClick={() => handleDeleteGroup(group.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prix mensuel</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.offres.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || !search).length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">Aucune offre dans ce groupe</TableCell></TableRow>
              ) : group.offres.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || !search).map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium text-foreground">{o.name}</TableCell>
                  <TableCell className="tabular-nums text-foreground">{formatCurrency(o.price)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditOffre({ ...o, groupName: group.name })} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                      <button onClick={() => handleDeleteOffre(o.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
