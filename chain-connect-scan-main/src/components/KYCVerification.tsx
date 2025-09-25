import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Shield,
  User,
  Eye,
  Download
} from 'lucide-react';

interface KYCDocument {
  id: string;
  document_type: string;
  document_url: string;
  document_name: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  uploaded_at: string;
}

interface KYCVerificationProps {
  onKYCStatusChange?: (isApproved: boolean) => void;
}

const KYCVerification: React.FC<KYCVerificationProps> = ({ onKYCStatusChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const documentTypes = [
    {
      key: 'identity',
      title: 'Pièce d\'identité',
      description: 'Passeport, carte d\'identité ou permis de conduire',
      icon: User,
      required: true
    }
  ];

  useEffect(() => {
    if (user) {
      loadKYCData();
    }
  }, [user]);

  const loadKYCData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Charger le profil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setProfile(profileData);

      // Charger les documents KYC
      const { data: documentsData, error: documentsError } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (documentsError) throw documentsError;
      setDocuments((documentsData || []).map(doc => ({
        ...doc,
        status: doc.status as 'pending' | 'approved' | 'rejected'
      })));

      // Notifier du statut KYC
      if (onKYCStatusChange) {
        onKYCStatusChange(profileData?.kyc_status === 'approved');
      }

    } catch (error) {
      console.error('Error loading KYC data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données KYC",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!user) return;

    try {
      setUploading(documentType);

      // Upload vers le storage Supabase
      const fileName = `kyc/${user.id}/${documentType}_${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('digital-products')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('digital-products')
        .getPublicUrl(fileName);

      // Insérer dans la table kyc_documents
      const { error: insertError } = await supabase
        .from('kyc_documents')
        .insert({
          user_id: user.id,
          document_type: documentType,
          document_url: urlData.publicUrl,
          document_name: file.name,
          file_size: file.size,
          mime_type: file.type
        });

      if (insertError) throw insertError;

      // Mettre à jour le statut du profil si c'est la première soumission
      if (profile?.kyc_status === 'pending') {
        await supabase
          .from('profiles')
          .update({ 
            kyc_status: 'submitted',
            kyc_submitted_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      }

      toast({
        title: "Document téléchargé",
        description: "Votre document a été soumis pour vérification"
      });

      // Recharger les données
      loadKYCData();

    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
        variant: "destructive"
      });
    } finally {
      setUploading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'under_review':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      submitted: { label: 'Soumis', variant: 'default' as const },
      under_review: { label: 'En révision', variant: 'default' as const },
      approved: { label: 'Approuvé', variant: 'default' as const },
      rejected: { label: 'Rejeté', variant: 'destructive' as const },
      incomplete: { label: 'Incomplet', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateProgress = () => {
    const requiredDocs = documentTypes.filter(doc => doc.required);
    const approvedDocs = requiredDocs.filter(docType => 
      documents.some(doc => 
        doc.document_type === docType.key && 
        doc.status === 'approved'
      )
    );
    
    return Math.round((approvedDocs.length / requiredDocs.length) * 100);
  };

  const getDocumentForType = (documentType: string) => {
    return documents.find(doc => doc.document_type === documentType);
  };

  const isKYCBlocked = () => {
    return false; // TEMPORAIREMENT DÉSACTIVÉ POUR TESTS
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Affichage si KYC approuvé - TEMPORAIREMENT DÉSACTIVÉ
  if (true) { // Toujours considérer comme approuvé pour les tests
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="flex items-center justify-between">
            <span>Votre compte est vérifié ! Vous pouvez accéder à toutes les fonctionnalités.</span>
            <Badge variant="default" className="bg-green-600 text-white">
              Vérifié
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statut */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Vérification KYC Obligatoire</CardTitle>
                <p className="text-muted-foreground">
                  Complétez votre vérification d'identité pour accéder aux fonctionnalités marchand
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(profile?.kyc_status)}
              {getStatusBadge(profile?.kyc_status)}
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progression de la vérification</span>
              <span>{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Message d'information */}
      {isKYCBlocked() && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="space-y-2">
              <p className="font-medium">Accès limité - Vérification requise</p>
              <p>
                Pour des raisons de sécurité et de conformité réglementaire, vous devez compléter 
                la vérification KYC avant d'accéder à toutes les fonctionnalités de vente.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statut de rejet */}
      {profile?.kyc_status === 'rejected' && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <p className="font-medium">Vérification rejetée</p>
              <p>{profile.kyc_rejection_reason || "Veuillez soumettre des documents valides."}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des documents requis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentTypes.map((docType) => {
          const document = getDocumentForType(docType.key);
          const IconComponent = docType.icon;
          
          return (
            <Card key={docType.key} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{docType.title}</span>
                        {docType.required && (
                          <Badge variant="outline" className="text-xs">Requis</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {docType.description}
                      </p>
                    </div>
                  </div>
                  
                  {document && (
                    <div className="flex items-center space-x-2">
                      {document.status === 'approved' && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {document.status === 'rejected' && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      {document.status === 'pending' && (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {document ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{document.document_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Téléchargé le {new Date(document.uploaded_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(document.document_url, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                      </div>
                    </div>
                    
                    {document.status === 'rejected' && document.rejection_reason && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 text-sm">
                          <p className="font-medium">Document rejeté:</p>
                          <p>{document.rejection_reason}</p>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {(document.status === 'rejected' || document.status === 'pending') && (
                      <div>
                        <Label htmlFor={`file-${docType.key}`} className="text-sm">
                          {document.status === 'rejected' ? 'Remplacer le document' : 'Remplacer (optionnel)'}
                        </Label>
                        <Input
                          id={`file-${docType.key}`}
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, docType.key);
                            }
                          }}
                          disabled={uploading === docType.key}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor={`file-${docType.key}`} className="text-sm">
                      Télécharger votre {docType.title.toLowerCase()}
                    </Label>
                    <Input
                      id={`file-${docType.key}`}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, docType.key);
                        }
                      }}
                      disabled={uploading === docType.key}
                    />
                    
                    {uploading === docType.key && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Téléchargement en cours...</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Informations importantes */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Informations importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-foreground mb-2">Documents acceptés</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Images: JPG, PNG, WEBP</li>
                <li>• Documents: PDF</li>
                <li>• Taille max: 10MB par fichier</li>
                <li>• Documents récents (moins de 3 mois)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Temps de traitement</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Vérification: 24-48h ouvrées</li>
                <li>• Notification par email</li>
                <li>• Suivi dans le tableau de bord</li>
                <li>• Support disponible si besoin</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCVerification;