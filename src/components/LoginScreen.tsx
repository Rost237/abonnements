import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Wifi, Eye, EyeOff } from "lucide-react";
import type { AppUser } from "@/types";

interface LoginScreenProps {
  users: AppUser[];
  onLogin: (user: AppUser) => void;
  onChangePassword: (userId: string, newPassword: string) => void;
}

export default function LoginScreen({ users, onLogin, onChangePassword }: LoginScreenProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);

  // First login password change
  const [changingUser, setChangingUser] = useState<AppUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = users.find(u => u.login === login && u.password === password);
    if (!user) {
      setError("Login ou mot de passe incorrect");
      return;
    }
    if (user.mustChangePassword) {
      setChangingUser(user);
      return;
    }
    onLogin(user);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changingUser) return;
    if (newPassword.length < 4) { setError("Le mot de passe doit contenir au moins 4 caractères"); return; }
    if (newPassword !== confirmPassword) { setError("Les mots de passe ne correspondent pas"); return; }
    onChangePassword(changingUser.id, newPassword);
    onLogin({ ...changingUser, password: newPassword, mustChangePassword: false });
  };

  if (changingUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="bg-card rounded-lg shadow-elevated p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center mx-auto">
                <Wifi className="text-warning-foreground" size={24} />
              </div>
              <h1 className="text-xl font-bold text-foreground">Changement de mot de passe</h1>
              <p className="text-sm text-muted-foreground">Bienvenue {changingUser.name}, veuillez choisir un nouveau mot de passe</p>
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Nouveau mot de passe</Label>
                <Input type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(""); }} placeholder="••••••••" className="h-11 rounded-md" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Confirmer le mot de passe</Label>
                <Input type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(""); }} placeholder="••••••••" className="h-11 rounded-md" />
              </div>
              <Button type="submit" className="w-full h-11 rounded-md font-semibold">Valider</Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
        <div className="bg-card rounded-lg shadow-elevated p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <Wifi className="text-primary-foreground" size={24} />
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">ISP Manager</h1>
            <p className="text-sm text-muted-foreground">Connectez-vous à votre compte</p>
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login" className="text-foreground">Login</Label>
              <Input id="login" value={login} onChange={e => { setLogin(e.target.value); setError(""); }} placeholder="Votre identifiant" className="h-11 rounded-md" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Mot de passe</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" className="h-11 rounded-md pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded border-input" />
              Se souvenir de moi
            </label>
            <Button type="submit" className="w-full h-11 rounded-md font-semibold">Connexion</Button>
          </form>
          <p className="text-xs text-center text-muted-foreground">
            Mot de passe oublié ? Contactez l'administrateur.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
