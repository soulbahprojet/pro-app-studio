import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { Building2, Mail, Phone, Globe, MapPin, FileText, CheckCircle, AlertCircle, Truck } from 'lucide-react';

interface FreightProfile {
  id?: string;
  company_name: string;
  company_address: string;
  city: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
  website_url: string;
  transport_types: string[];
  operating_countries: string[];
  subscription_plan: string;
  is_verified: boolean;
  is_active: boolean;
}

const FreightProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<FreightProfile>({
    company_name: '',
    company_address: '',
    city: '',
    country: '',
    postal_code: '',
    phone: '',
    email: '',
    website_url: '',
    transport_types: [],
    operating_countries: [],
    subscription_plan: 'basic',
    is_verified: false,
    is_active: true
  });

  const transportTypes = [
    { value: 'air', label: 'Aérien' },
    { value: 'sea', label: 'Maritime' },
    { value: 'road', label: 'Routier' },
    { value: 'combined', label: 'Combiné' }
  ];

  const countries = [
    'France', 'Guinée', 'Sénégal', 'Mali', 'Côte d\'Ivoire', 'Burkina Faso',
    'Allemagne', 'Belgique', 'Espagne', 'Italie', 'Maroc', 'Tunisie'
  ];

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('freight_forwarder_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      }

    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const profileData = {
        ...profile,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (profile.id) {
        // Update existing profile
        const { error } = await supabase
          .from('freight_forwarder_profiles')
          .update(profileData)
          .eq('id', profile.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('freight_forwarder_profiles')
          .insert(profileData)
          .select()
          .single();

        if (error) throw error;
        
        setProfile(prev => ({ ...prev, id: data.id }));
      }

      toast({
        title: "Succès",
        description: "Profil sauvegardé avec succès",
      });

    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTransportTypeToggle = (type: string) => {
    setProfile(prev => ({
      ...prev,
      transport_types: prev.transport_types.includes(type)
        ? prev.transport_types.filter(t => t !== type)
        : [...prev.transport_types, type]
    }));
  };

  const handleCountryToggle = (country: string) => {
    setProfile(prev => ({
      ...prev,
      operating_countries: prev.operating_countries.includes(country)
        ? prev.operating_countries.filter(c => c !== country)
        : [...prev.operating_countries, country]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Profil Transitaire</h2>
          <p className="text-muted-foreground">
            Gérez les informations de votre entreprise de transport
          </p>
        </div>
        <div className="flex items-center gap-2">
          {profile.is_verified ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Vérifié
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="w-3 h-3 mr-1" />
              En attente de vérification
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations de l'entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Nom de l'entreprise *</Label>
              <Input
                id="company_name"
                value={profile.company_name}
                onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Transport International SARL"
              />
            </div>

            <div>
              <Label htmlFor="company_address">Adresse *</Label>
              <Textarea
                id="company_address"
                value={profile.company_address}
                onChange={(e) => setProfile(prev => ({ ...prev, company_address: e.target.value }))}
                placeholder="123 Avenue de la République"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Conakry"
                />
              </div>
              <div>
                <Label htmlFor="postal_code">Code postal</Label>
                <Input
                  id="postal_code"
                  value={profile.postal_code}
                  onChange={(e) => setProfile(prev => ({ ...prev, postal_code: e.target.value }))}
                  placeholder="00000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country">Pays *</Label>
              <Select value={profile.country} onValueChange={(value) => setProfile(prev => ({ ...prev, country: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un pays" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Informations de contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+224 123 456 789"
              />
            </div>

            <div>
              <Label htmlFor="email">Email professionnel *</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@transport.com"
              />
            </div>

            <div>
              <Label htmlFor="website_url">Site web</Label>
              <Input
                id="website_url"
                value={profile.website_url}
                onChange={(e) => setProfile(prev => ({ ...prev, website_url: e.target.value }))}
                placeholder="https://www.transport.com"
              />
            </div>

            <div>
              <Label htmlFor="subscription_plan">Plan d'abonnement</Label>
              <Select value={profile.subscription_plan} onValueChange={(value) => setProfile(prev => ({ ...prev, subscription_plan: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Types de transport */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Types de transport
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {transportTypes.map(type => (
                <Button
                  key={type.value}
                  variant={profile.transport_types.includes(type.value) ? "default" : "outline"}
                  onClick={() => handleTransportTypeToggle(type.value)}
                  className="justify-start"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pays d'opération */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Pays d'opération
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {countries.map(country => (
                <Button
                  key={country}
                  variant={profile.operating_countries.includes(country) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCountryToggle(country)}
                  className="justify-start text-xs"
                >
                  {country}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button 
          onClick={saveProfile}
          disabled={saving}
          size="lg"
        >
          {saving ? "Sauvegarde..." : "Sauvegarder le profil"}
        </Button>
      </div>
    </div>
  );
};

export default FreightProfile;
