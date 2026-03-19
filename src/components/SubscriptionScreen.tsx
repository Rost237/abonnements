import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import type { Offre } from "@/components/OffresScreen";

const durations = [
  { label: "1 mois", value: 1 },
  { label: "3 mois", value: 3 },
  { label: "6 mois", value: 6 },
  { label: "12 mois", value: 12 },
];

interface SubscriptionScreenProps {
  offres: Offre[];
}

export default function SubscriptionScreen({ offres }: SubscriptionScreenProps) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [codeFat, setCodeFat] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const total = selectedOffer !== null && offres[selectedOffer] ? offres[selectedOffer].price * selectedDuration : 0;
  const formatCurrency = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printContent = receiptRef.current.innerHTML;
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;
    win.document.write(`
      <html><head><title>Reçu</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 20px; max-width: 302px; margin: 0 auto; }
        .receipt-header { text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 12px; margin-bottom: 12px; }
        .receipt-header .title { font-size: 14px; font-weight: bold; }
        .receipt-header .subtitle { font-size: 11px; color: #666; }
        .receipt-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; }
        .receipt-row .label { color: #666; }
        .receipt-row .value { font-weight: 500; }
        .receipt-row .mono { font-family: monospace; font-weight: bold; }
        .receipt-total { text-align: center; border-top: 1px solid #ddd; padding-top: 12px; margin-top: 12px; }
        .receipt-total .label { font-size: 11px; color: #666; }
        .receipt-total .amount { font-size: 22px; font-weight: bold; }
      </style></head><body>
      <div class="receipt-header">
        <p class="title">ISP Manager</p>
        <p class="subtitle">Reçu de paiement</p>
      </div>
      <div class="receipt-row"><span class="label">Client</span><span class="value">${clientName}</span></div>
      <div class="receipt-row"><span class="label">Tél</span><span class="value">${clientPhone}</span></div>
      <div class="receipt-row"><span class="label">Offre</span><span class="value">${selectedOffer !== null && offres[selectedOffer] ? offres[selectedOffer].name : ""}</span></div>
      <div class="receipt-row"><span class="label">Durée</span><span class="value">${selectedDuration} mois</span></div>
      <div class="receipt-row"><span class="label">Code FAT</span><span class="mono">${codeFat}</span></div>
      <div class="receipt-total">
        <p class="label">Total</p>
        <p class="amount">${formatCurrency(total)}</p>
      </div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  if (showReceipt) {
    return (
      <div className="max-w-sm mx-auto space-y-4">
        <h2 className="text-xl font-bold text-foreground tracking-tight text-center">Reçu</h2>
        <div ref={receiptRef} className="bg-card rounded-lg shadow-elevated p-6 space-y-4" style={{ maxWidth: "302px", margin: "0 auto" }}>
          <div className="text-center border-b border-border pb-3">
            <p className="text-sm font-bold text-foreground">ISP Manager</p>
            <p className="text-xs text-muted-foreground">Reçu de paiement</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Client</span><span className="font-medium text-foreground">{clientName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tél</span><span className="text-foreground">{clientPhone}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Offre</span><span className="text-foreground">{selectedOffer !== null && offres[selectedOffer] ? offres[selectedOffer].name : ""}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Durée</span><span className="text-foreground">{selectedDuration} mois</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Code FAT</span><span className="font-mono font-bold text-foreground">{codeFat}</span></div>
          </div>
          <div className="border-t border-border pt-3 text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">{formatCurrency(total)}</p>
          </div>
        </div>
        <div className="flex gap-2 max-w-[302px] mx-auto">
          <Button variant="outline" className="flex-1 rounded-md" onClick={() => setShowReceipt(false)}>Retour</Button>
          <Button className="flex-1 rounded-md" onClick={handlePrint}>Imprimer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-lg">
      <h2 className="text-xl font-bold text-foreground tracking-tight">Nouvel Abonnement</h2>

      <div className="bg-card rounded-lg shadow-card p-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground">Nom du client</Label>
          <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nom complet" className="h-11 rounded-md" />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Téléphone</Label>
          <Input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="6XX XXX XXX" className="h-11 rounded-md" />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Code FAT</Label>
          <Input value={codeFat} onChange={e => setCodeFat(e.target.value)} placeholder="Code FAT" className="h-11 rounded-md font-mono" />
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label className="text-foreground">Durée</Label>
        <div className="grid grid-cols-4 gap-2">
          {durations.map(d => (
            <button
              key={d.value}
              onClick={() => setSelectedDuration(d.value)}
              className={`py-2.5 rounded-md text-sm font-medium transition-all ${selectedDuration === d.value ? "bg-primary text-primary-foreground shadow-sm" : "bg-card text-foreground shadow-card hover:bg-accent"}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Offers */}
      <div className="space-y-2">
        <Label className="text-foreground">Offre</Label>
        {offres.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune offre disponible. Créez des offres dans l'onglet Offres.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {offres.map((o, i) => (
              <motion.button
                key={o.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedOffer(i)}
                className={`relative bg-card rounded-lg shadow-card p-4 text-left transition-all ${selectedOffer === i ? "ring-2 ring-primary" : "hover:bg-accent"}`}
              >
                {selectedOffer === i && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check size={12} className="text-primary-foreground" />
                  </div>
                )}
                <p className="text-sm font-semibold text-foreground">{o.name}</p>
                <p className="text-lg font-bold tabular-nums text-foreground mt-1">{formatCurrency(o.price)}</p>
                <p className="text-xs text-muted-foreground">/mois</p>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="bg-card rounded-lg shadow-elevated p-4 flex items-center justify-between sticky bottom-0">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold tabular-nums text-foreground">{formatCurrency(total)}</p>
        </div>
        <Button
          disabled={!clientName || selectedOffer === null || !codeFat}
          onClick={() => setShowReceipt(true)}
          className="h-11 px-6 rounded-md font-semibold"
        >
          Confirmer
        </Button>
      </div>
    </div>
  );
}
