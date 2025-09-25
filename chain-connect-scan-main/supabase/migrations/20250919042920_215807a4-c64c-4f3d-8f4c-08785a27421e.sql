-- Création du système de gestion des bureaux syndicaux

-- Types énumérés
CREATE TYPE user_type AS ENUM ('pdg', 'bureau_syndical', 'travailleur');
CREATE TYPE access_level AS ENUM ('complet', 'limite', 'lecture_seule');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critique');

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

-- Table des fonctionnalités disponibles
CREATE TABLE fonctionnalites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL,
  type_utilisateur user_type NOT NULL,
  is_active BOOLEAN DEFAULT true,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des alertes et notifications
CREATE TABLE alertes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  severity alert_severity DEFAULT 'info',
  destinataire_type user_type NOT NULL,
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
  sender_type user_type NOT NULL,
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
  feature_id UUID NOT NULL REFERENCES fonctionnalites(id),
  version_number TEXT NOT NULL,
  changelog TEXT,
  release_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_current BOOLEAN DEFAULT false
);

-- Enable RLS sur toutes les tables
ALTER TABLE bureaux_syndicaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE travailleurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE motos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fonctionnalites ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions_travailleurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications_technique ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_versions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour bureaux_syndicaux
CREATE POLICY "PDG peut tout voir des bureaux" ON bureaux_syndicaux
  FOR ALL USING (is_pdg_user());

CREATE POLICY "Bureaux peuvent voir leurs données" ON bureaux_syndicaux
  FOR SELECT USING (auth.uid()::text IN (
    SELECT token FROM bureaux_syndicaux WHERE token = auth.uid()::text
  ));

-- Politiques RLS pour travailleurs
CREATE POLICY "PDG peut tout voir des travailleurs" ON travailleurs
  FOR ALL USING (is_pdg_user());

CREATE POLICY "Bureaux peuvent gérer leurs travailleurs" ON travailleurs
  FOR ALL USING (bureau_id IN (
    SELECT id FROM bureaux_syndicaux WHERE token = auth.uid()::text
  ));

CREATE POLICY "Travailleurs peuvent voir leurs données" ON travailleurs
  FOR SELECT USING (token = auth.uid()::text);

-- Politiques RLS pour motos
CREATE POLICY "PDG peut tout voir des motos" ON motos
  FOR ALL USING (is_pdg_user());

CREATE POLICY "Propriétaires peuvent gérer leurs motos" ON motos
  FOR ALL USING (travailleur_id IN (
    SELECT id FROM travailleurs WHERE token = auth.uid()::text
  ));

-- Politiques RLS pour fonctionnalités
CREATE POLICY "Fonctionnalités visibles par tous les authentifiés" ON fonctionnalites
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "PDG peut gérer fonctionnalités" ON fonctionnalites
  FOR ALL USING (is_pdg_user());

-- Politiques RLS pour alertes
CREATE POLICY "PDG peut gérer toutes les alertes" ON alertes
  FOR ALL USING (is_pdg_user());

CREATE POLICY "Utilisateurs voient leurs alertes" ON alertes
  FOR SELECT USING (
    (destinataire_type = 'bureau_syndical' AND destinataire_id::text IN (
      SELECT id::text FROM bureaux_syndicaux WHERE token = auth.uid()::text
    )) OR
    (destinataire_type = 'travailleur' AND destinataire_id::text IN (
      SELECT id::text FROM travailleurs WHERE token = auth.uid()::text
    )) OR
    destinataire_id IS NULL
  );

-- Politiques RLS pour permissions_travailleurs
CREATE POLICY "Bureaux gèrent permissions de leurs travailleurs" ON permissions_travailleurs
  FOR ALL USING (travailleur_id IN (
    SELECT t.id FROM travailleurs t 
    JOIN bureaux_syndicaux b ON t.bureau_id = b.id 
    WHERE b.token = auth.uid()::text
  ));

-- Politiques RLS pour communications_technique
CREATE POLICY "PDG peut voir toutes les communications" ON communications_technique
  FOR ALL USING (is_pdg_user());

CREATE POLICY "Utilisateurs peuvent créer communications" ON communications_technique
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bureaux_syndicaux_updated_at
  BEFORE UPDATE ON bureaux_syndicaux
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travailleurs_updated_at
  BEFORE UPDATE ON travailleurs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer des tokens uniques
CREATE OR REPLACE FUNCTION generate_unique_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Insérer quelques fonctionnalités de base
INSERT INTO fonctionnalites (nom, description, version, type_utilisateur) VALUES
('Gestion des travailleurs', 'Ajouter, modifier et supprimer des travailleurs', '1.0.0', 'bureau_syndical'),
('Enregistrement des motos', 'Enregistrer les numéros de série des motos', '1.0.0', 'travailleur'),
('Notifications', 'Système de notifications en temps réel', '1.0.0', 'travailleur'),
('Alertes critiques', 'Réception des alertes importantes', '1.0.0', 'bureau_syndical'),
('Dashboard statistiques', 'Visualisation des données globales', '1.0.0', 'pdg'),
('Communication technique', 'Contact avec équipe technique', '1.0.0', 'bureau_syndical');