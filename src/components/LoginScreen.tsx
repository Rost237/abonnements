import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Wifi } from "lucide-react";

interface LoginScreenProps {
  onLogin: (role: "admin" | "vendeur" | "gerant") => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: admin/admin → admin, else vendeur
    if (login === "admin") onLogin("admin");
    else onLogin("vendeur");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="bg-card rounded-lg shadow-elevated p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <Wifi className="text-primary-foreground" size={24} />
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">ISP Manager</h1>
            <p className="text-sm text-muted-foreground">Connectez-vous à votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login" className="text-foreground">Login</Label>
              <Input
                id="login"
                value={login}
                onChange={e => setLogin(e.target.value)}
                placeholder="Votre identifiant"
                className="h-11 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-md"
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-md font-semibold">
              Connexion
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            Demo: login "admin" pour admin, autre pour vendeur
          </p>
        </div>
      </motion.div>
    </div>
  );
}
