import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  CreditCard,
  Building,
  User,
  Camera
} from 'lucide-react';

interface VendorProfile {
  id: string;
  business_name: string;
  business_type: string;
  registration_number?: string;
  tax_id?: string;
  address: any;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  logo?: string;
  kyc_status: string;
  kyc_documents: any[];
  is_active: boolean;
}

interface KYCDocument {
  type: string;
  url: string;
  status: string;
  uploaded_at: string;
}

export default function VendorKYC() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const [businessForm, setBusinessForm] = useState({
    business_name: '',
    business_type: 'retail',
    registration_number: '',
    tax_id: '',
    phone: '',
    website: '',
    description: '',
    address: {
      street: '',
      city: '',
      country: 'Guinée'
    }
  });

  const businessTypes = [
    { value: 'retail', label: 'Commerce de détail' },
    { value: 'wholesale', label: 'Commerce de gros' },
    { value: 'manufacturing', label: 'Fabrication' },
    { value: 'services', label: 'Services' },
    { value: 'restaurant', label: 'Restauration' },
    { value: 'technology', label: 'Technologie' },
    { value: 'fashion', label: 'Mode' },
    { value: 'other', label: 'Autre' }
  ];

  const requiredDocuments = [
    {
      type: 'identity',
      title: 'Pièce d\'identité',
      description: 'Carte d\'identité, passeport ou permis de conduire',
      icon: User,
      required: true
    },
    {
      type: 'business_license',
      title: 'Licence commerciale',
      description: 'Certificat d\'enregistrement de l\'entreprise',
      icon: Building,
      required: true
    },
    {
      type: 'tax_certificate',
      title: 'Certificat fiscal',
      description: 'Numéro d\'identification fiscale',
      icon: FileText,
      required: false
    },
    {
      type: 'bank_statement',
      title: 'Relevé bancaire',
      description: 'Relevé bancaire récent (3 derniers mois)',
      icon: CreditCard,
      required: true
    }
  ];

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profil n'existe pas, créer un nouveau
        await createProfile();
        return;
      }

      if (error) throw error;
      
      setProfile(data);
      setBusinessForm({
        business_name: data.business_name || '',
        business_type: data.business_type || 'retail',
        registration_number: data.registration_number || '',
        tax_id: data.tax_id || '',
        phone: data.phone || '',
        website: data.website || '',
        description: data.description || '',
        address: (typeof data.address === 'object' && data.address && !Array.isArray(data.address)) ? 
          data.address as { street: string; city: string; country: string; } : 
          { street: '', city: '', country: 'Guinée' }
      });

      // Déterminer l'étape active basée sur le statut
      if (data.kyc_status === 'incomplete') {
        setActiveStep(0);
      } else if (data.kyc_status === 'pending') {
        setActiveStep(2);
      } else {
        setActiveStep(3);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .insert({
          user_id: user?.id,
          business_name: 'Ma Boutique',
          business_type: 'retail',
          email: user?.email || '',
          phone: '',
          kyc_status: 'incomplete',
          kyc_documents: [],
          is_active: false
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Erreur création profil:', error);
    }
  };

  const handleBusinessInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('vendor_profiles')
        .update({
          business_name: businessForm.business_name,
          business_type: businessForm.business_type,
          registration_number: businessForm.registration_number,
          tax_id: businessForm.tax_id,
          phone: businessForm.phone,
          website: businessForm.website,
          description: businessForm.description,
          address: businessForm.address
        })
        .eq('id', profile?.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Informations commerciales mises à jour"
      });

      setActiveStep(1);
      loadProfile();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    try {
      setUploading(true);

      // Upload vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${documentType}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      // Mettre à jour les documents KYC dans le profil
      const currentDocs = profile?.kyc_documents || [];
      const updatedDocs = [
        ...currentDocs.filter((doc: any) => doc.type !== documentType),
        {
          type: documentType,
          url: publicUrl,
          status: 'pending',
          uploaded_at: new Date().toISOString()
        }
      ];

      const { error } = await supabase
        .from('vendor_profiles')
        .update({
          kyc_documents: updatedDocs
        })
        .eq('id', profile?.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Document téléchargé avec succès"
      });

      loadProfile();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const submitForReview = async () => {
    try {
      const requiredDocTypes = requiredDocuments
        .filter(doc => doc.required)
        .map(doc => doc.type);

      const uploadedDocTypes = (profile?.kyc_documents || []).map((doc: any) => doc.type);
      const missingDocs = requiredDocTypes.filter(type => !uploadedDocTypes.includes(type));

      if (missingDocs.length > 0) {
        toast({
          title: "Documents manquants",
          description: "Veuillez télécharger tous les documents requis",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('vendor_profiles')
        .update({
          kyc_status: 'pending'
        })
        .eq('id', profile?.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre dossier a été soumis pour vérification"
      });

      setActiveStep(2);
      loadProfile();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getDocumentStatus = (docType: string) => {
    const doc = (profile?.kyc_documents || []).find((d: any) => d.type === docType);
    return doc?.status || 'missing';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-400';
    }
  };

  const getCompletionPercentage = () => {
    if (!profile) return 0;
    
    const steps = [
      profile.business_name && profile.business_type && profile.phone,
      requiredDocuments.filter(doc => doc.required).every(doc => 
        getDocumentStatus(doc.type) !== 'missing'
      ),
      profile.kyc_status === 'pending' || profile.kyc_status === 'approved',
      profile.kyc_status === 'approved'
    ];
    
    const completedSteps = steps.filter(Boolean).length;
    return (completedSteps / steps.length) * 100;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          Chargement des informations KYC...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statut */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vérification KYC</h2>
          <p className="text-muted-foreground">
            Complétez votre vérification pour activer votre boutique
          </p>
        </div>
        
        <div className="text-right">
          <Badge variant={
            profile?.kyc_status === 'approved' ? 'default' :
            profile?.kyc_status === 'pending' ? 'secondary' :
            'destructive'
          }>
            {profile?.kyc_status === 'approved' && 'Vérifié'}
            {profile?.kyc_status === 'pending' && 'En cours de vérification'}
            {profile?.kyc_status === 'rejected' && 'Rejeté'}
            {profile?.kyc_status === 'incomplete' && 'À compléter'}
          </Badge>
        </div>
      </div>

      {/* Barre de progression */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Progression de la vérification</h3>
              <span className="text-sm text-muted-foreground">
                {Math.round(getCompletionPercentage())}% complété
              </span>
            </div>
            
            <Progress value={getCompletionPercentage()} className="h-2" />
            
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className={`flex items-center gap-2 ${activeStep >= 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  activeStep >= 0 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>1</div>
                Informations
              </div>
              
              <div className={`flex items-center gap-2 ${activeStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  activeStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>2</div>
                Documents
              </div>
              
              <div className={`flex items-center gap-2 ${activeStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  activeStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>3</div>
                Vérification
              </div>
              
              <div className={`flex items-center gap-2 ${activeStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  activeStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'
                }`}>✓</div>
                Approuvé
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Étape 1: Informations commerciales */}
      {activeStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informations commerciales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBusinessInfoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name">Nom de l'entreprise *</Label>
                  <Input
                    id="business_name"
                    value={businessForm.business_name}
                    onChange={(e) => setBusinessForm({...businessForm, business_name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="business_type">Type d'entreprise *</Label>
                  <select
                    id="business_type"
                    value={businessForm.business_type}
                    onChange={(e) => setBusinessForm({...businessForm, business_type: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    {businessTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registration_number">Numéro d'enregistrement</Label>
                  <Input
                    id="registration_number"
                    value={businessForm.registration_number}
                    onChange={(e) => setBusinessForm({...businessForm, registration_number: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tax_id">Numéro fiscal</Label>
                  <Input
                    id="tax_id"
                    value={businessForm.tax_id}
                    onChange={(e) => setBusinessForm({...businessForm, tax_id: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={businessForm.phone}
                  onChange={(e) => setBusinessForm({...businessForm, phone: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={businessForm.website}
                  onChange={(e) => setBusinessForm({...businessForm, website: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="description">Description de l'activité</Label>
                <Textarea
                  id="description"
                  value={businessForm.description}
                  onChange={(e) => setBusinessForm({...businessForm, description: e.target.value})}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Continuer vers les documents
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Étape 2: Upload de documents */}
      {activeStep === 1 && (
        <div className="space-y-4">
          {requiredDocuments.map(doc => {
            const Icon = doc.icon;
            const status = getDocumentStatus(doc.type);
            
            return (
              <Card key={doc.type}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                      
                      <div>
                        <h4 className="font-medium">
                          {doc.title}
                          {doc.required && <span className="text-red-500 ml-1">*</span>}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {doc.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, doc.type);
                          }}
                          className="hidden"
                          id={`upload-${doc.type}`}
                        />
                        <label htmlFor={`upload-${doc.type}`} className="cursor-pointer">
                          <Button size="sm" variant="outline" disabled={uploading}>
                            <Upload className="h-3 w-3 mr-1" />
                            {status === 'missing' ? 'Télécharger' : 'Remplacer'}
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardContent className="p-6 text-center">
              <Button 
                onClick={submitForReview}
                className="w-full"
                disabled={requiredDocuments
                  .filter(doc => doc.required)
                  .some(doc => getDocumentStatus(doc.type) === 'missing')
                }
              >
                <Shield className="h-4 w-4 mr-2" />
                Soumettre pour vérification
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Étape 3: En cours de vérification */}
      {activeStep === 2 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-16 w-16 mx-auto mb-6 text-yellow-600" />
            <h3 className="text-xl font-semibold mb-4">Vérification en cours</h3>
            <p className="text-muted-foreground mb-6">
              Votre dossier est en cours d'examen par notre équipe. 
              Vous recevrez une notification une fois la vérification terminée.
            </p>
            <Badge variant="secondary">
              Délai de traitement: 1-3 jours ouvrables
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Étape 4: Approuvé */}
      {activeStep === 3 && profile?.kyc_status === 'approved' && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-6 text-green-600" />
            <h3 className="text-xl font-semibold mb-4">Vérification approuvée</h3>
            <p className="text-muted-foreground mb-6">
              Félicitations ! Votre compte vendeur est maintenant vérifié. 
              Vous pouvez commencer à vendre vos produits.
            </p>
            <Button onClick={() => window.location.reload()}>
              <Shield className="h-4 w-4 mr-2" />
              Accéder à ma boutique
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Rejeté */}
      {profile?.kyc_status === 'rejected' && (
        <Card className="border-red-200">
          <CardContent className="p-12 text-center">
            <XCircle className="h-16 w-16 mx-auto mb-6 text-red-600" />
            <h3 className="text-xl font-semibold mb-4">Vérification rejetée</h3>
            <p className="text-muted-foreground mb-6">
              Votre dossier a été rejeté. Veuillez corriger les informations 
              et soumettre à nouveau vos documents.
            </p>
            <Button variant="outline" onClick={() => setActiveStep(0)}>
              Recommencer la vérification
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}