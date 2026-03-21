import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, RotateCcw, Link2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { AppUser, UserRole, Zone, Sector } from "@/types";

const roleLabels: Record<UserRole, string> = { admin: "Administrateur", coadmin: "CoAdministrateur", gerant: "Gérant", vendeur: "Vendeur" };
const roleBadgeClass: Record<UserRole, string> = {
  admin: "bg-primary/15 text-primary border-primary/30",
  coadmin: "bg-primary/15 text-primary border-primary/30",
  gerant: "bg-warning/15 text-warning border-warning/30",
  vendeur: "bg-success/15 text-success border-success/30",
};

interface UsersScreenProps {
  currentUser: AppUser;
  users: AppUser[];
  onUsersChange: (users: AppUser[]) => void;
  zones: Zone[];
  sectors: Sector[];
}

const emptyForm = { name: "", login: "", role: "vendeur" as UserRole, zones: [] as string[], secteurs: [] as string[], objectifMensuel: 0, gerantId: "" };

export default function UsersScreen({ currentUser, users, onUsersChange, zones, sectors }: UsersScreenProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [linkDialog, setLinkDialog] = useState<AppUser | null>(null);
  const [copied, setCopied] = useState(false);

  const isAdmin = currentUser.role === "admin" || currentUser.role === "coadmin";
  const gerants = users.filter(u => u.role === "gerant");

  const filtered = users.filter(u =>
    [u.name, u.login, u.role].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  const generateLoginLink = (user: AppUser) => {
    const base = window.location.origin;
    return `${base}/?login=${encodeURIComponent(user.login)}`;
  };

  const handleCopyLink = async (user: AppUser) => {
    const link = generateLoginLink(user);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier");
    }
  };

  const handleShareWhatsApp = (user: AppUser) => {
    const link = generateLoginLink(user);
    const text = `Bonjour ${user.name}, voici votre lien de connexion à ISP Manager :\n${link}\n\nLogin : ${user.login}\nMot de passe par défaut : password\n\nVeuillez modifier votre mot de passe à la première connexion.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleSave = () => {
    if (!form.name || !form.login) return;
    if (editing) {
      onUsersChange(users.map(u => u.id === editing.id ? { ...u, name: form.name, login: form.login, role: form.role, zones: form.zones, secteurs: form.secteurs, objectifMensuel: form.objectifMensuel, gerantId: form.gerantId || undefined } : u));
    } else {
      const newUser: AppUser = {
        id: crypto.randomUUID(),
        login: form.login,
        password: "password",
        role: form.role,
        name: form.name,
        mustChangePassword: true,
        zones: form.zones,
        secteurs: form.secteurs,
        objectifMensuel: form.objectifMensuel,
        gerantId: form.gerantId || undefined,
      };
      onUsersChange([...users, newUser]);
      // Show link dialog after creation
      setOpen(false);
      setForm(emptyForm);
      setEditing(null);
      setLinkDialog(newUser);
      return;
    }
    setForm(emptyForm);
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (user: AppUser) => {
    setEditing(user);
    setForm({ name: user.name, login: user.login, role: user.role, zones: user.zones, secteurs: user.secteurs, objectifMensuel: user.objectifMensuel, gerantId: user.gerantId || "" });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (id === "admin-root") return;
    onUsersChange(users.filter(u => u.id !== id));
  };

  const handleResetPassword = (id: string) => {
    onUsersChange(users.map(u => u.id === id ? { ...u, password: "password", mustChangePassword: true } : u));
    toast.success("Mot de passe réinitialisé");
  };

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };

  if (!isAdmin) {
    return (
      <div className="space-y-4 max-w-lg">
        <h2 className="text-xl font-bold text-foreground">Utilisateurs</h2>
        <p className="text-sm text-muted-foreground">Vous n'avez pas les droits pour gérer les utilisateurs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Utilisateurs</h2>
        <Button onClick={openNew} className="h-10 rounded-md gap-2"><Plus size={16} /> Nouvel utilisateur</Button>
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-foreground">Nom *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jean Dupont" className="h-10 rounded-md" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground">Login *</Label>
                <Input value={form.login} onChange={e => setForm(f => ({ ...f, login: e.target.value }))} placeholder="jean.dupont" className="h-10 rounded-md" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground">Rôle *</Label>
              <Select value={form.role} onValueChange={(v: UserRole) => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger className="h-10 rounded-md"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="coadmin">CoAdministrateur</SelectItem>
                  <SelectItem value="gerant">Gérant</SelectItem>
                  <SelectItem value="vendeur">Vendeur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.role === "vendeur" && (
              <div className="space-y-1.5">
                <Label className="text-foreground">Gérant responsable</Label>
                <Select value={form.gerantId} onValueChange={v => setForm(f => ({ ...f, gerantId: v }))}>
                  <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Choisir un gérant" /></SelectTrigger>
                  <SelectContent>
                    {gerants.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {form.role === "vendeur" && (
              <div className="space-y-1.5">
                <Label className="text-foreground">Secteurs de travail</Label>
                <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-md min-h-[40px]">
                  {sectors.map(s => (
                    <button key={s.id} onClick={() => setForm(f => ({ ...f, secteurs: f.secteurs.includes(s.id) ? f.secteurs.filter(x => x !== s.id) : [...f.secteurs, s.id] }))}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${form.secteurs.includes(s.id) ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-accent"}`}>
                      {s.nom}
                    </button>
                  ))}
                  {sectors.length === 0 && <p className="text-xs text-muted-foreground">Aucun secteur créé</p>}
                </div>
              </div>
            )}
            {form.role === "gerant" && (
              <div className="space-y-1.5">
                <Label className="text-foreground">Zones de travail</Label>
                <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-md min-h-[40px]">
                  {zones.map(z => (
                    <button key={z.id} onClick={() => setForm(f => ({ ...f, zones: f.zones.includes(z.id) ? f.zones.filter(x => x !== z.id) : [...f.zones, z.id] }))}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${form.zones.includes(z.id) ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-accent"}`}>
                      {z.nom}
                    </button>
                  ))}
                  {zones.length === 0 && <p className="text-xs text-muted-foreground">Aucune zone créée</p>}
                </div>
              </div>
            )}
            {(form.role === "gerant" || form.role === "vendeur") && (
              <div className="space-y-1.5">
                <Label className="text-foreground">Objectif mensuel (FCFA)</Label>
                <Input type="number" value={form.objectifMensuel || ""} onChange={e => setForm(f => ({ ...f, objectifMensuel: Number(e.target.value) }))} placeholder="500000" className="h-10 rounded-md" />
              </div>
            )}
            {!editing && (
              <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                ⚠️ Mot de passe par défaut : <span className="font-mono font-bold">password</span> — L'utilisateur devra le modifier à sa première connexion.
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-md" onClick={() => setOpen(false)}>Annuler</Button>
              <Button className="flex-1 rounded-md" onClick={handleSave} disabled={!form.name || !form.login}>{editing ? "Modifier" : "Créer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link sharing dialog */}
      <Dialog open={!!linkDialog} onOpenChange={() => { setLinkDialog(null); setCopied(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Link2 size={18} /> Lien de connexion généré</DialogTitle>
          </DialogHeader>
          {linkDialog && (
            <div className="space-y-4 pt-2">
              <div className="bg-muted p-3 rounded-md space-y-2">
                <p className="text-sm text-foreground"><strong>Utilisateur :</strong> {linkDialog.name}</p>
                <p className="text-sm text-foreground"><strong>Login :</strong> <span className="font-mono">{linkDialog.login}</span></p>
                <p className="text-sm text-foreground"><strong>Rôle :</strong> {roleLabels[linkDialog.role]}</p>
                <p className="text-sm text-muted-foreground"><strong>Mot de passe :</strong> <span className="font-mono">password</span></p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs">Lien de connexion</Label>
                <div className="flex gap-2">
                  <Input readOnly value={generateLoginLink(linkDialog)} className="h-10 rounded-md font-mono text-xs" />
                  <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => handleCopyLink(linkDialog)}>
                    {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-md" onClick={() => handleShareWhatsApp(linkDialog)}>
                  📱 Envoyer par WhatsApp
                </Button>
                <Button className="flex-1 rounded-md" onClick={() => { setLinkDialog(null); setCopied(false); }}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un utilisateur..." className="pl-9 h-10 rounded-md" />
      </div>

      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Login</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead className="hidden sm:table-cell">Objectif</TableHead>
              <TableHead className="w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Aucun utilisateur</TableCell></TableRow>
            ) : filtered.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-foreground">{u.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{u.login}</TableCell>
                <TableCell><Badge variant="outline" className={roleBadgeClass[u.role] + " text-xs"}>{roleLabels[u.role]}</Badge></TableCell>
                <TableCell className="hidden sm:table-cell tabular-nums text-muted-foreground">{u.objectifMensuel > 0 ? new Intl.NumberFormat("fr-FR").format(u.objectifMensuel) + " FCFA" : "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {u.id !== "admin-root" && (
                      <>
                        <button onClick={() => setLinkDialog(u)} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-primary" title="Lien de connexion"><Link2 size={14} /></button>
                        <button onClick={() => handleEdit(u)} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" title="Modifier"><Pencil size={14} /></button>
                        <button onClick={() => handleResetPassword(u.id)} className="p-1.5 rounded-md hover:bg-warning/10 transition-colors text-muted-foreground hover:text-warning" title="Réinitialiser mot de passe"><RotateCcw size={14} /></button>
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive" title="Supprimer"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{users.length} utilisateur(s) au total</p>
    </div>
  );
}
