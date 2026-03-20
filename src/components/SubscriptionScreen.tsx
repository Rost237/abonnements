import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";
import type { OffreGroup, Client, Zone, Sector, FAT, AppUser, Subscription, CompanyConfig, UserRole } from "@/types";

const durations = [
  { label: "1 mois", value: 1 },
  { label: "3 mois", value: 3 },
  { label: "6 mois", value: 6 },
  { label: "12 mois", value: 12 },
];

interface SubscriptionScreenProps {
  offreGroups: OffreGroup[];
  userRole: UserRole;
  currentUser: AppUser;
  clients: Client[];
  onClientsChange: (clients: Client[]) => void;
  zones: Zone[];
  sectors: Sector[];
  fats: FAT[];
  users: AppUser[];
  subscriptions: Subscription[];
  onSubscriptionsChange: (subs: Subscription[]) => void;
  config: CompanyConfig;
}

export default function SubscriptionScreen({ offreGroups, userRole, currentUser, clients, onClientsChange, zones, sectors, fats, users, subscriptions, onSubscriptionsChange, config }: SubscriptionScreenProps) {
  const [mode, setMode] = useState<"choose" | "new" | "existing">("choose");
  const [selectedClientId, setSelectedClientId] = useState("");
  // New client fields
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientZone, setNewClientZone] = useState("");
  const [newClientSecteur, setNewClientSecteur] = useState("");
  // Subscription fields
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedOffreId, setSelectedOffreId] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedSecteur, setSelectedSecteur] = useState("");
  const [selectedFat, setSelectedFat] = useState("");
  const [modePaiement, setModePaiement] = useState("");
  const [vendeurId, setVendeurId] = useState(currentUser.id);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSub, setLastSub] = useState<Subscription | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const canCreate = userRole === "admin" || userRole === "coadmin" || userRole === "vendeur";
  const vendeurs = users.filter(u => u.role === "vendeur" || u.role === "admin" || u.role === "coadmin");
  const allOffres = offreGroups.flatMap(g => g.offres);
  const selectedGroup = offreGroups.find(g => g.id === selectedGroupId);
  const selectedOffre = allOffres.find(o => o.id === selectedOffreId);
  const total = selectedOffre ? selectedOffre.price * selectedDuration : 0;
  const formatCurrency = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " " + (config.devise || "FCFA");

  const filteredSectors = selectedZone ? sectors.filter(s => s.zoneId === selectedZone) : sectors;

  const handleConfirm = () => {
    let clientId = selectedClientId;
    let clientName = "";
    let clientPhone = "";

    if (mode === "new") {
      const newClient: Client = {
        id: crypto.randomUUID(), name: newClientName, phone: newClientPhone, email: "", zone: newClientZone, secteur: newClientSecteur,
        nbUtilisateurs: 1, typeClient: "menage", localisation: "", status: "actif"
      };
      onClientsChange([...clients, newClient]);
      clientId = newClient.id;
      clientName = newClient.name;
      clientPhone = newClient.phone;
    } else {
      const c = clients.find(c => c.id === selectedClientId);
      if (c) { clientName = c.name; clientPhone = c.phone; onClientsChange(clients.map(cl => cl.id === c.id ? { ...cl, status: "actif" } : cl)); }
    }

    const vendeur = users.find(u => u.id === vendeurId);
    const zone = zones.find(z => z.id === selectedZone);
    const secteur = sectors.find(s => s.id === selectedSecteur);
    const fat = fats.find(f => f.id === selectedFat);
    const group = offreGroups.find(g => g.id === selectedGroupId);

    const sub: Subscription = {
      id: crypto.randomUUID(), clientId, clientName, clientPhone, vendeurId, vendeurName: vendeur?.name || "",
      offreId: selectedOffreId, offreName: selectedOffre?.name || "", groupName: group?.name || "",
      zoneId: selectedZone, zoneName: zone?.nom || "", secteurId: selectedSecteur, secteurName: secteur?.nom || "",
      fatCode: fat?.code || "", duration: selectedDuration, modePaiement, total,
      date: new Date().toISOString(),
    };
    onSubscriptionsChange([...subscriptions, sub]);
    setLastSub(sub);
    setShowReceipt(true);
  };

  const handlePrint = () => {
    if (!lastSub) return;
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;
    win.document.write(`<html><head><title>Reçu</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:20px;max-width:302px;margin:0 auto}
        .hdr{text-align:center;border-bottom:1px solid #ddd;padding-bottom:12px;margin-bottom:12px}
        .hdr .t{font-size:14px;font-weight:bold}.hdr .s{font-size:11px;color:#666}
        .row{display:flex;justify-content:space-between;font-size:13px;padding:4px 0}
        .row .l{color:#666}.row .v{font-weight:500}
        .tot{text-align:center;border-top:1px solid #ddd;padding-top:12px;margin-top:12px}
        .tot .l{font-size:11px;color:#666}.tot .a{font-size:22px;font-weight:bold}
      </style></head><body>
      <div class="hdr"><p class="t">${config.nom || "ISP Manager"}</p><p class="s">${config.sigle || ""} — Reçu de paiement</p><p class="s">${new Date(lastSub.date).toLocaleDateString("fr-FR")}</p></div>
      <div class="row"><span class="l">Client</span><span class="v">${lastSub.clientName}</span></div>
      <div class="row"><span class="l">Tél</span><span class="v">${lastSub.clientPhone}</span></div>
      <div class="row"><span class="l">Offre</span><span class="v">${lastSub.groupName} — ${lastSub.offreName}</span></div>
      <div class="row"><span class="l">Durée</span><span class="v">${lastSub.duration} mois</span></div>
      <div class="row"><span class="l">Zone</span><span class="v">${lastSub.zoneName}</span></div>
      <div class="row"><span class="l">Secteur</span><span class="v">${lastSub.secteurName}</span></div>
      <div class="row"><span class="l">FAT</span><span class="v">${lastSub.fatCode}</span></div>
      <div class="row"><span class="l">Vendeur</span><span class="v">${lastSub.vendeurName}</span></div>
      <div class="row"><span class="l">Paiement</span><span class="v">${lastSub.modePaiement}</span></div>
      <div class="tot"><p class="l">Total</p><p class="a">${formatCurrency(lastSub.total)}</p></div>
      </body></html>`);
    win.document.close();
    win.print();
  };

  if (!canCreate) {
    return (
      <div className="space-y-4 max-w-lg">
        <h2 className="text-xl font-bold text-foreground">Abonnements</h2>
        <p className="text-sm text-muted-foreground">Vous n'avez pas les droits pour créer des abonnements.</p>
      </div>
    );
  }

  if (showReceipt && lastSub) {
    return (
      <div className="max-w-sm mx-auto space-y-4">
        <h2 className="text-xl font-bold text-foreground text-center">Reçu</h2>
        <div ref={receiptRef} className="bg-card rounded-lg shadow-elevated p-6 space-y-3" style={{ maxWidth: "302px", margin: "0 auto" }}>
          <div className="text-center border-b border-border pb-3">
            <p className="text-sm font-bold text-foreground">{config.nom || "ISP Manager"}</p>
            <p className="text-xs text-muted-foreground">{config.sigle} — Reçu de paiement</p>
            <p className="text-xs text-muted-foreground">{new Date(lastSub.date).toLocaleDateString("fr-FR")}</p>
          </div>
          <div className="space-y-1.5 text-sm">
            {[
              ["Client", lastSub.clientName], ["Tél", lastSub.clientPhone],
              ["Offre", `${lastSub.groupName} — ${lastSub.offreName}`], ["Durée", `${lastSub.duration} mois`],
              ["Zone", lastSub.zoneName], ["Secteur", lastSub.secteurName],
              ["FAT", lastSub.fatCode], ["Vendeur", lastSub.vendeurName], ["Paiement", lastSub.modePaiement],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between"><span className="text-muted-foreground">{l}</span><span className="font-medium text-foreground">{v}</span></div>
            ))}
          </div>
          <div className="border-t border-border pt-3 text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">{formatCurrency(lastSub.total)}</p>
          </div>
        </div>
        <div className="flex gap-2 max-w-[302px] mx-auto">
          <Button variant="outline" className="flex-1 rounded-md" onClick={() => { setShowReceipt(false); setMode("choose"); }}>Nouveau</Button>
          <Button className="flex-1 rounded-md" onClick={handlePrint}>Imprimer</Button>
        </div>
      </div>
    );
  }

  if (mode === "choose") {
    return (
      <div className="space-y-5 max-w-lg">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Nouvel Abonnement</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-20 rounded-md font-semibold flex flex-col gap-1" onClick={() => setMode("new")}>
            <span className="text-lg">+</span>
            <span>Nouveau client</span>
          </Button>
          <Button variant="outline" className="h-20 rounded-md font-semibold flex flex-col gap-1" onClick={() => setMode("existing")} disabled={clients.length === 0}>
            <span className="text-lg">📋</span>
            <span>Client existant</span>
          </Button>
        </div>
      </div>
    );
  }

  const isValid = mode === "new"
    ? newClientName && newClientPhone && selectedOffreId && selectedZone && selectedFat && modePaiement
    : selectedClientId && selectedOffreId && selectedZone && selectedFat && modePaiement;

  return (
    <div className="space-y-5 max-w-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Nouvel Abonnement</h2>
        <Button variant="ghost" size="sm" onClick={() => setMode("choose")}>← Retour</Button>
      </div>

      {mode === "new" ? (
        <div className="bg-card rounded-lg shadow-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Nouveau client</h3>
          <div className="space-y-1.5">
            <Label className="text-foreground">Noms et prénoms *</Label>
            <Input value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Nom complet" className="h-10 rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">Téléphone *</Label>
            <Input value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="6XX XXX XXX" className="h-10 rounded-md" />
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Client existant</h3>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
            <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name} — {c.phone}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Informations d'abonnement</h3>
        {(userRole === "admin" || userRole === "coadmin") && (
          <div className="space-y-1.5">
            <Label className="text-foreground">Vendeur</Label>
            <Select value={vendeurId} onValueChange={setVendeurId}>
              <SelectTrigger className="h-10 rounded-md"><SelectValue /></SelectTrigger>
              <SelectContent>{vendeurs.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-foreground">Zone *</Label>
            <Select value={selectedZone} onValueChange={v => { setSelectedZone(v); setSelectedSecteur(""); }}>
              <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>{zones.map(z => <SelectItem key={z.id} value={z.id}>{z.nom}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">Secteur</Label>
            <Select value={selectedSecteur} onValueChange={setSelectedSecteur}>
              <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>{filteredSectors.map(s => <SelectItem key={s.id} value={s.id}>{s.nom}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground">FAT *</Label>
          <Select value={selectedFat} onValueChange={setSelectedFat}>
            <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Choisir un FAT" /></SelectTrigger>
            <SelectContent>{fats.map(f => <SelectItem key={f.id} value={f.id}>{f.code} — {f.nom}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground">Mode de paiement *</Label>
          <Select value={modePaiement} onValueChange={setModePaiement}>
            <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>{config.modesPaiement.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Durée</Label>
        <div className="grid grid-cols-4 gap-2">
          {durations.map(d => (
            <button key={d.value} onClick={() => setSelectedDuration(d.value)}
              className={`py-2.5 rounded-md text-sm font-medium transition-all ${selectedDuration === d.value ? "bg-primary text-primary-foreground shadow-sm" : "bg-card text-foreground shadow-card hover:bg-accent"}`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Groupe d'offres</Label>
        <div className="flex gap-2 flex-wrap">
          {offreGroups.map(g => (
            <button key={g.id} onClick={() => { setSelectedGroupId(g.id); setSelectedOffreId(""); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${selectedGroupId === g.id ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {selectedGroup && (
        <div className="space-y-2">
          <Label className="text-foreground">Offre *</Label>
          <div className="grid grid-cols-2 gap-3">
            {selectedGroup.offres.map(o => (
              <motion.button key={o.id} whileTap={{ scale: 0.97 }} onClick={() => setSelectedOffreId(o.id)}
                className={`relative bg-card rounded-lg shadow-card p-4 text-left transition-all ${selectedOffreId === o.id ? "ring-2 ring-primary" : "hover:bg-accent"}`}>
                {selectedOffreId === o.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"><Check size={12} className="text-primary-foreground" /></div>
                )}
                <p className="text-sm font-semibold text-foreground">{o.name}</p>
                <p className="text-lg font-bold tabular-nums text-foreground mt-1">{formatCurrency(o.price)}</p>
                <p className="text-xs text-muted-foreground">/mois</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-elevated p-4 flex items-center justify-between sticky bottom-0">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold tabular-nums text-foreground">{formatCurrency(total)}</p>
        </div>
        <Button disabled={!isValid} onClick={handleConfirm} className="h-11 px-6 rounded-md font-semibold">Confirmer</Button>
      </div>
    </div>
  );
}
