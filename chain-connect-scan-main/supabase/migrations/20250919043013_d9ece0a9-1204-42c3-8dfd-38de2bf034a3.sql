-- Création du système de gestion des bureaux syndicaux (version adaptée)

-- Types énumérés (en vérifiant s'ils existent déjà)
DO $$ BEGIN
    CREATE TYPE access_level AS ENUM ('complet', 'limite', 'lecture_seule');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critique');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table des bureaux syndicaux
CREATE TABLE bureaux_syndicaux (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  email_president TEXT NOT NULL,
  ville TEXT NOT NULL,
  interface_url TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des travailleurs
CREATE TABLE travailleurs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bureau_id UUID NOT NULL REFERENCES bureaux_syndicaux(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  interface_url TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  access_level access_level DEFAULT 'limite',
  is_active BOOLEAN DEFAULT true,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des motos enregistrées
CREATE TABLE motos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  travailleur_id UUID NOT NULL REFERENCES travailleurs(id) ON DELETE CASCADE,
  numero_serie TEXT NOT NULL,
  marque TEXT,
  modele TEXT,
  annee INTEGER,
  statut TEXT DEFAULT 'active',
  date_enregistrement TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des fonctionnalités disponibles pour le syndicat
CREATE TABLE fonctionnalites_syndicat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL,
  type_utilisateur TEXT NOT NULL, -- 'pdg', 'bureau_syndical', 'travailleur'
  is_active BOOLEAN DEFAULT true,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des alertes et notifications pour le syndicat
CREATE TABLE alertes_syndicat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  severity alert_severity DEFAULT 'info',
  destinataire_type TEXT NOT NULL, -- 'pdg', 'bureau_syndical', 'travailleur'
  destinataire_id UUID, -- peut être NULL pour alertes globales
  is_read BOOLEAN DEFAULT false,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des permissions spécifiques aux travailleurs
CREATE TABLE permissions_travailleurs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  travailleur_id UUID NOT NULL REFERENCES travailleurs(id) ON DELETE CASCADE,
  permission_name TEXT NOT NULL,
  is_granted BOOLEAN DEFAULT false,
  granted_by UUID REFERENCES bureaux_syndicaux(id),
  date_granted TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des communications avec l'équipe technique
CREATE TABLE communications_technique (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_type TEXT NOT NULL, -- 'bureau_syndical', 'travailleur'
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  contact_method TEXT NOT NULL, -- 'sms', 'call', 'email'
  status TEXT DEFAULT 'pending',
  response TEXT,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT now(),
  date_responded TIMESTAMP WITH TIME ZONE
);

-- Table de versioning des fonctionnalités
CREATE TABLE feature_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_id UUID NOT NULL REFERENCES fonctionnalites_syndicat(id),
  version_number TEXT NOT NULL,
  changelog TEXT,
  release_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_current BOOLEAN DEFAULT false
);

-- Enable RLS sur toutes les tables
ALTER TABLE bureaux_syndicaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE travailleurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE motos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fonctionnalites_syndicat ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes_syndicat ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions_travailleurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications_technique ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_versions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour bureaux_syndicaux
CREATE POLICY "PDG peut tout voir des bureaux" ON bureaux_syndicaux
  FOR ALL USING (is_pdg_user());

-- Politiques RLS pour travailleurs
CREATE POLICY "PDG peut tout voir des travailleurs" ON travailleurs
  FOR ALL USING (is_pdg_user());

-- Politiques RLS pour motos
CREATE POLICY "PDG peut tout voir des motos" ON motos
  FOR ALL USING (is_pdg_user());

-- Politiques RLS pour fonctionnalités
CREATE POLICY "Fonctionnalités visibles par tous les authentifiés" ON fonctionnalites_syndicat
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "PDG peut gérer fonctionnalités" ON fonctionnalites_syndicat
  FOR ALL USING (is_pdg_user());

-- Politiques RLS pour alertes
CREATE POLICY "PDG peut gérer toutes les alertes" ON alertes_syndicat
  FOR ALL USING (is_pdg_user());

-- Politiques RLS pour communications_technique
CREATE POLICY "PDG peut voir toutes les communications" ON communications_technique
  FOR ALL USING (is_pdg_user());

CREATE POLICY "Utilisateurs peuvent créer communications" ON communications_technique
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Fonction pour générer des tokens uniques
CREATE OR REPLACE FUNCTION generate_syndicat_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at (si la fonction n'existe pas déjà)
CREATE OR REPLACE FUNCTION update_syndicat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bureaux_syndicaux_updated_at
  BEFORE UPDATE ON bureaux_syndicaux
  FOR EACH ROW EXECUTE FUNCTION update_syndicat_updated_at();

CREATE TRIGGER update_travailleurs_updated_at
  BEFORE UPDATE ON travailleurs
  FOR EACH ROW EXECUTE FUNCTION update_syndicat_updated_at();

-- Insérer quelques fonctionnalités de base
INSERT INTO fonctionnalites_syndicat (nom, description, version, type_utilisateur) VALUES
('Gestion des travailleurs', 'Ajouter, modifier et supprimer des travailleurs', '1.0.0', 'bureau_syndical'),
('Enregistrement des motos', 'Enregistrer les numéros de série des motos', '1.0.0', 'travailleur'),
('Notifications', 'Système de notifications en temps réel', '1.0.0', 'travailleur'),
('Alertes critiques', 'Réception des alertes importantes', '1.0.0', 'bureau_syndical'),
('Dashboard statistiques', 'Visualisation des données globales', '1.0.0', 'pdg'),
('Communication technique', 'Contact avec équipe technique', '1.0.0', 'bureau_syndical');