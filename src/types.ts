export type UserRole = "admin" | "coadmin" | "gerant" | "vendeur";

export interface AppUser {
  id: string;
  login: string;
  password: string;
  role: UserRole;
  name: string;
  mustChangePassword: boolean;
  zones: string[];
  secteurs: string[];
  objectifMensuel: number;
  gerantId?: string;
}

export interface Sector {
  id: string;
  nom: string;
  zoneId: string;
  code: string;
}

export interface OffreGroup {
  id: string;
  name: string;
  offres: Offre[];
}

export interface Offre {
  id: string;
  groupId: string;
  name: string;
  price: number;
}

export interface Subscription {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  vendeurId: string;
  vendeurName: string;
  offreId: string;
  offreName: string;
  groupName: string;
  zoneId: string;
  zoneName: string;
  secteurId: string;
  secteurName: string;
  fatCode: string;
  duration: number;
  modePaiement: string;
  total: number;
  date: string;
}

export interface CompanyConfig {
  nom: string;
  sigle: string;
  regime: string;
  capital: string;
  rccm: string;
  compteBancaire: string;
  localisation: string;
  contacts: string;
  siteWeb: string;
  boitePostale: string;
  devise: string;
  modesPaiement: string[];
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  zone: string;
  secteur: string;
  nbUtilisateurs: number;
  typeClient: "entreprise" | "menage";
  localisation: string;
  status: "actif" | "prospect" | "inactif";
}

export interface Zone {
  id: string;
  nom: string;
  code: string;
  ville: string;
  quartier: string;
  localisation: string;
  description: string;
}

export interface FAT {
  id: string;
  nom: string;
  code: string;
  ville: string;
  quartier: string;
  localisation: string;
  description: string;
}
