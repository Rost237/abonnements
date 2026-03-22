import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save, Upload, Trash2 } from "lucide-react";
import type { CompanyConfig, UserRole } from "@/types";

interface SettingsScreenProps {
  config: CompanyConfig;
  onConfigChange: (config: CompanyConfig) => void;
  userRole: UserRole;
}

export default function SettingsScreen({ config, onConfigChange, userRole }: SettingsScreenProps) {
  const [form, setForm] = useState<CompanyConfig>(config);
  const [newMode, setNewMode] = useState("");
  const isAdmin = userRole === "admin" || userRole === "coadmin";
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => { onConfigChange(form); };
  const addMode = () => {
    if (!newMode.trim()) return;
    setForm(f => ({ ...f, modesPaiement: [...f.modesPaiement, newMode.trim()] }));
    setNewMode("");
  };
  const removeMode = (i: number) => setForm(f => ({ ...f, modesPaiement: f.modesPaiement.filter((_, idx) => idx !== i) }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) { alert("Le fichier est trop volumineux (max 500 Ko)"); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, logo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  if (!isAdmin) {
    return (
      <div className="space-y-4 max-w-lg">
        <h2 className="text-xl font-bold text-foreground">Paramètres</h2>
        <p className="text-sm text-muted-foreground">Seul l'administrateur peut modifier les paramètres.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-foreground tracking-tight">Configuration de l'entreprise</h2>

      {/* Logo */}
      <div className="bg-card rounded-lg shadow-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Logo de l'entreprise</h3>
        <div className="flex items-center gap-4">
          {form.logo ? (
            <div className="relative">
              <img src={form.logo} alt="Logo" className="w-20 h-20 rounded-lg object-contain border border-border bg-background" />
              <button onClick={() => setForm(f => ({ ...f, logo: "" }))} className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                <Trash2 size={10} />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
              <Upload size={20} className="text-muted-foreground" />
            </div>
          )}
          <div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => fileRef.current?.click()}>
              <Upload size={14} /> {form.logo ? "Changer" : "Télécharger"}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG — max 500 Ko</p>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={handleLogoUpload} />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Informations légales</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-foreground">Nom de l'entreprise</Label>
            <Input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} className="h-10 rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">Sigle</Label>
            <Input value={form.sigle} onChange={e => setForm(f => ({ ...f, sigle: e.target.value }))} className="h-10 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-foreground">Régime fiscal</Label>
            <Input value={form.regime} onChange={e => setForm(f => ({ ...f, regime: e.target.value }))} className="h-10 rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">Capital</Label>
            <Input value={form.capital} onChange={e => setForm(f => ({ ...f, capital: e.target.value }))} className="h-10 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-foreground">RCCM</Label>
            <Input value={form.rccm} onChange={e => setForm(f => ({ ...f, rccm: e.target.value }))} className="h-10 rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">Compte bancaire</Label>
            <Input value={form.compteBancaire} onChange={e => setForm(f => ({ ...f, compteBancaire: e.target.value }))} className="h-10 rounded-md" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Coordonnées</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-foreground">Localisation</Label>
            <Input value={form.localisation} onChange={e => setForm(f => ({ ...f, localisation: e.target.value }))} className="h-10 rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">Contacts</Label>
            <Input value={form.contacts} onChange={e => setForm(f => ({ ...f, contacts: e.target.value }))} className="h-10 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-foreground">Site internet</Label>
            <Input value={form.siteWeb} onChange={e => setForm(f => ({ ...f, siteWeb: e.target.value }))} className="h-10 rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">Boîte postale</Label>
            <Input value={form.boitePostale} onChange={e => setForm(f => ({ ...f, boitePostale: e.target.value }))} className="h-10 rounded-md" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Paramètres financiers</h3>
        <div className="space-y-1.5">
          <Label className="text-foreground">Devise</Label>
          <Input value={form.devise} onChange={e => setForm(f => ({ ...f, devise: e.target.value }))} className="h-10 rounded-md max-w-xs" />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Modes de paiement</Label>
          <div className="flex flex-wrap gap-2">
            {form.modesPaiement.map((m, i) => (
              <Badge key={i} variant="outline" className="gap-1 text-foreground">
                {m}
                <button onClick={() => removeMode(i)} className="text-muted-foreground hover:text-destructive"><X size={12} /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newMode} onChange={e => setNewMode(e.target.value)} placeholder="Nouveau mode..." className="h-9 rounded-md flex-1" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addMode())} />
            <Button variant="outline" size="sm" onClick={addMode} className="gap-1"><Plus size={14} /> Ajouter</Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Les factures sont disponibles le 1er du mois. Coupure le 7 si impayé.</p>
      </div>

      <Button onClick={handleSave} className="gap-2 h-11 rounded-md font-semibold">
        <Save size={16} /> Enregistrer les paramètres
      </Button>
    </div>
  );
}
