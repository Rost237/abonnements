import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Check, Plus } from "lucide-react";
import type { OffreGroup, Client, Zone, Sector, FAT, AppUser, Subscription, CompanyConfig, UserRole, PaymentStatus } from "@/types";

const durations = [
  { label: "1 mois", value: 1 },
  { label: "3 mois", value: 3 },
  { label: "6 mois", value: 6 },
  { label: "12 mois", value: 12 },
];

const operateurs = ["MTN Mobile Money", "Orange Money", "Airtel Money", "Autre"];

interface SubscriptionScreenProps {
  offreGroups: OffreGroup[];
  userRole: UserRole;
  currentUser: AppUser;
  clients: Client[];
  onClientsChange: (clients: Client[]) => void;
  zones: Zone[];
  sectors: Sector[];
  onSectorsChange: (sectors: Sector[]) => void;
  fats: FAT[];
  users: AppUser[];
  subscriptions: Subscription[];
  onSubscriptionsChange: (subs: Subscription[]) => void;
  config: CompanyConfig;
}

export default function SubscriptionScreen({ offreGroups, userRole, currentUser, clients, onClientsChange, zones, sectors, onSectorsChange, fats, users, subscriptions, onSubscriptionsChange, config }: SubscriptionScreenProps) {
  const [mode, setMode] = useState<"choose" | "new" | "existing">("choose");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientZone, setNewClientZone] = useState("");
  const [newClientSecteur, setNewClientSecteur] = useState("");
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

  // Payment enhancements
  const [refTransaction, setRefTransaction] = useState("");
  const [statutPaiement, setStatutPaiement] = useState<PaymentStatus>("reussi");
  const [operateurMobile, setOperateurMobile] = useState("");
  const [montantPaye, setMontantPaye] = useState<number | "">("");
  const [renouvellementAuto, setRenouvellementAuto] = useState(false);

  // Sector creation dialog
  const [showNewSector, setShowNewSector] = useState(false);
  const [newSectorName, setNewSectorName] = useState("");
  const [newSectorCode, setNewSectorCode] = useState("");

  const canCreate = userRole === "admin" || userRole === "coadmin" || userRole === "vendeur";
  const vendeurs = users.filter(u => u.role === "vendeur" || u.role === "admin" || u.role === "coadmin");
  const allOffres = offreGroups.flatMap(g => g.offres);
  const selectedGroup = offreGroups.find(g => g.id === selectedGroupId);
  const selectedOffre = allOffres.find(o => o.id === selectedOffreId);
  const total = selectedOffre ? selectedOffre.price * selectedDuration : 0;
  const devise = config.devise || "FCFA";
  const formatCurrency = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " " + devise;

  const filteredSectors = selectedZone ? sectors.filter(s => s.zoneId === selectedZone) : sectors;

  const isMobileMoney = modePaiement.toLowerCase().includes("mobile") || modePaiement.toLowerCase().includes("money");

  const handleCreateSector = () => {
    if (!newSectorName || !selectedZone) return;
    const newSec: Sector = { id: crypto.randomUUID(), nom: newSectorName, code: newSectorCode, zoneId: selectedZone };
    onSectorsChange([...sectors, newSec]);
    setSelectedSecteur(newSec.id);
    setNewSectorName("");
    setNewSectorCode("");
    setShowNewSector(false);
  };

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

    const now = new Date();
    const dateDebut = now.toISOString();
    const dateFin = new Date(now.getTime() + selectedDuration * 30 * 24 * 60 * 60 * 1000).toISOString();

    const sub: Subscription = {
      id: crypto.randomUUID(), clientId, clientName, clientPhone, vendeurId, vendeurName: vendeur?.name || "",
      offreId: selectedOffreId, offreName: selectedOffre?.name || "", groupName: group?.name || "",
      zoneId: selectedZone, zoneName: zone?.nom || "", secteurId: selectedSecteur, secteurName: secteur?.nom || "",
      fatCode: fat?.code || "", duration: selectedDuration, modePaiement, total,
      date: now.toISOString(),
      dateDebut,
      dateFin,
      renouvellementAuto,
      refTransaction,
      statutPaiement,
      operateurMobile: isMobileMoney ? operateurMobile : "",
      montantPaye: typeof montantPaye === "number" ? montantPaye : total,
    };
    onSubscriptionsChange([...subscriptions, sub]);
    setLastSub(sub);
    setShowReceipt(true);
  };

  const handlePrint = () => {
    if (!lastSub) return;
    const logoHtml = config.logo ? `<img src="${config.logo}" style="width:60px;height:60px;object-fit:contain;margin:0 auto 8px" />` : "";
    const paidLabel = lastSub.montantPaye < lastSub.total ? `<div class="row"><span class="l">Payé</span><span class="v">${formatCurrency(lastSub.montantPaye)}</span></div><div class="row"><span class="l">Reste</span><span class="v" style="color:#e53e3e">${formatCurrency(lastSub.total - lastSub.montantPaye)}</span></div>` : "";
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
        .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600}
        .badge-ok{background:#c6f6d5;color:#276749}.badge-wait{background:#fefcbf;color:#975a16}.badge-fail{background:#fed7d7;color:#9b2c2c}
      </style></head><body>
      <div class="hdr">${logoHtml}<p class="t">${config.nom || "ISP Manager"}</p><p class="s">${config.sigle || ""} — Reçu de paiement</p><p class="s">${new Date(lastSub.date).toLocaleDateString("fr-FR")}</p></div>
      <div class="row"><span class="l">Client</span><span class="v">${lastSub.clientName}</span></div>
      <div class="row"><span class="l">Tél</span><span class="v">${lastSub.clientPhone}</span></div>
      <div class="row"><span class="l">Offre</span><span class="v">${lastSub.groupName} — ${lastSub.offreName}</span></div>
      <div class="row"><span class="l">Durée</span><span class="v">${lastSub.duration} mois</span></div>
      <div class="row"><span class="l">Début</span><span class="v">${new Date(lastSub.dateDebut).toLocaleDateString("fr-FR")}</span></div>
      <div class="row"><span class="l">Fin</span><span class="v">${new Date(lastSub.dateFin).toLocaleDateString("fr-FR")}</span></div>
      <div class="row"><span class="l">Zone</span><span class="v">${lastSub.zoneName}</span></div>
      <div class="row"><span class="l">Secteur</span><span class="v">${lastSub.secteurName}</span></div>
      <div class="row"><span class="l">FAT</span><span class="v">${lastSub.fatCode}</span></div>
      <div class="row"><span class="l">Vendeur</span><span class="v">${lastSub.vendeurName}</span></div>
      <div class="row"><span class="l">Paiement</span><span class="v">${lastSub.modePaiement}${lastSub.operateurMobile ? " (" + lastSub.operateurMobile + ")" : ""}</span></div>
      ${lastSub.refTransaction ? `<div class="row"><span class="l">Réf.</span><span class="v">${lastSub.refTransaction}</span></div>` : ""}
      <div class="row"><span class="l">Statut</span><span class="badge ${lastSub.statutPaiement === "reussi" ? "badge-ok" : lastSub.statutPaiement === "en_attente" ? "badge-wait" : "badge-fail"}">${lastSub.statutPaiement === "reussi" ? "Réussi" : lastSub.statutPaiement === "en_attente" ? "En attente" : "Échoué"}</span></div>
      ${paidLabel}
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
    const statusColor = lastSub.statutPaiement === "reussi" ? "bg-success/10 text-success" : lastSub.statutPaiement === "en_attente" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive";
    const statusLabel = lastSub.statutPaiement === "reussi" ? "Réussi" : lastSub.statutPaiement === "en_attente" ? "En attente" : "Échoué";
    return (
      <div className="max-w-sm mx-auto space-y-4">
        <h2 className="text-xl font-bold text-foreground text-center">Reçu</h2>
        <div ref={receiptRef} className="bg-card rounded-lg shadow-elevated p-6 space-y-3" style={{ maxWidth: "302px", margin: "0 auto" }}>
          <div className="text-center border-b border-border pb-3">
            {config.logo && <img src={config.logo} alt="Logo" className="w-14 h-14 object-contain mx-auto mb-2" />}
            <p className="text-sm font-bold text-foreground">{config.nom || "ISP Manager"}</p>
            <p className="text-xs text-muted-foreground">{config.sigle} — Reçu de paiement</p>
            <p className="text-xs text-muted-foreground">{new Date(lastSub.date).toLocaleDateString("fr-FR")}</p>
          </div>
          <div className="space-y-1.5 text-sm">
            {[
              ["Client", lastSub.clientName], ["Tél", lastSub.clientPhone],
              ["Offre", `${lastSub.groupName} — ${lastSub.offreName}`], ["Durée", `${lastSub.duration} mois`],
              ["Début", new Date(lastSub.dateDebut).toLocaleDateString("fr-FR")],
              ["Fin", new Date(lastSub.dateFin).toLocaleDateString("fr-FR")],
              ["Zone", lastSub.zoneName], ["Secteur", lastSub.secteurName],
              ["FAT", lastSub.fatCode], ["Vendeur", lastSub.vendeurName],
              ["Paiement", `${lastSub.modePaiement}${lastSub.operateurMobile ? ` (${lastSub.operateurMobile})` : ""}`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between"><span className="text-muted-foreground">{l}</span><span className="font-medium text-foreground">{v}</span></div>
            ))}
            {lastSub.refTransaction && <div className="flex justify-between"><span className="text-muted-foreground">Réf.</span><span className="font-medium text-foreground">{lastSub.refTransaction}</span></div>}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Statut</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusColor}`}>{statusLabel}</span>
            </div>
            {lastSub.montantPaye < lastSub.total && (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">Payé</span><span className="font-medium text-foreground">{formatCurrency(lastSub.montantPaye)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Reste</span><span className="font-medium text-destructive">{formatCurrency(lastSub.total - lastSub.montantPaye)}</span></div>
              </>
            )}
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
            <div className="flex gap-1">
              <Select value={selectedSecteur} onValueChange={setSelectedSecteur}>
                <SelectTrigger className="h-10 rounded-md flex-1"><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>{filteredSectors.map(s => <SelectItem key={s.id} value={s.id}>{s.nom}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => setShowNewSector(true)} disabled={!selectedZone}>
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground">FAT *</Label>
          <Select value={selectedFat} onValueChange={setSelectedFat}>
            <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Choisir un FAT" /></SelectTrigger>
            <SelectContent>{fats.map(f => <SelectItem key={f.id} value={f.id}>{f.code} — {f.nom}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Payment section */}
      <div className="bg-card rounded-lg shadow-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Paiement</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-foreground">Mode de paiement *</Label>
            <Select value={modePaiement} onValueChange={setModePaiement}>
              <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>{config.modesPaiement.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">Statut paiement</Label>
            <Select value={statutPaiement} onValueChange={v => setStatutPaiement(v as PaymentStatus)}>
              <SelectTrigger className="h-10 rounded-md"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="reussi">✅ Réussi</SelectItem>
                <SelectItem value="en_attente">⏳ En attente</SelectItem>
                <SelectItem value="echoue">❌ Échoué</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {isMobileMoney && (
          <div className="space-y-1.5">
            <Label className="text-foreground">Opérateur Mobile Money</Label>
            <Select value={operateurMobile} onValueChange={setOperateurMobile}>
              <SelectTrigger className="h-10 rounded-md"><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>{operateurs.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-foreground">Référence transaction</Label>
            <Input value={refTransaction} onChange={e => setRefTransaction(e.target.value)} placeholder="REF-XXXX" className="h-10 rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">Montant payé</Label>
            <Input type="number" value={montantPaye} onChange={e => setMontantPaye(e.target.value ? Number(e.target.value) : "")} placeholder={String(total)} className="h-10 rounded-md" />
          </div>
        </div>
        {typeof montantPaye === "number" && montantPaye > 0 && montantPaye < total && (
          <p className="text-xs text-warning font-medium">⚠️ Paiement partiel — Reste: {formatCurrency(total - montantPaye)}</p>
        )}
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

      {/* Renouvellement auto */}
      <div className="flex items-center justify-between bg-card rounded-lg shadow-card p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Renouvellement automatique</p>
          <p className="text-xs text-muted-foreground">Renouveler à l'expiration</p>
        </div>
        <Switch checked={renouvellementAuto} onCheckedChange={setRenouvellementAuto} />
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

      {/* New Sector Dialog */}
      <Dialog open={showNewSector} onOpenChange={setShowNewSector}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Nouveau secteur</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-foreground">Nom *</Label>
              <Input value={newSectorName} onChange={e => setNewSectorName(e.target.value)} placeholder="Nom du secteur" className="h-10 rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground">Code</Label>
              <Input value={newSectorCode} onChange={e => setNewSectorCode(e.target.value)} placeholder="SEC-XXX" className="h-10 rounded-md" />
            </div>
            <p className="text-xs text-muted-foreground">Zone: {zones.find(z => z.id === selectedZone)?.nom || "—"}</p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-md" onClick={() => setShowNewSector(false)}>Annuler</Button>
              <Button className="flex-1 rounded-md" onClick={handleCreateSector} disabled={!newSectorName}>Créer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
