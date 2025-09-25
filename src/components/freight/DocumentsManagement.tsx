import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Trash2,
  Eye
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  size: string;
  required: boolean;
}

export default function DocumentsManagement() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Facture commerciale',
      type: 'invoice',
      status: 'verified',
      uploadedAt: '2024-01-15',
      size: '2.3 MB',
      required: true
    },
    {
      id: '2',
      name: 'Certificat d\'origine',
      type: 'certificate',
      status: 'pending',
      uploadedAt: '2024-01-15',
      size: '1.8 MB',
      required: true
    },
    {
      id: '3',
      name: 'Liste de colisage',
      type: 'packing_list',
      status: 'rejected',
      uploadedAt: '2024-01-14',
      size: '0.9 MB',
      required: false
    }
  ]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simuler l'upload avec progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "Document uploadé",
            description: "Le document a été uploadé avec succès"
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDelete = (docId: string) => {
    setDocuments(docs => docs.filter(doc => doc.id !== docId));
    toast({
      title: "Document supprimé",
      description: "Le document a été supprimé avec succès"
    });
  };

  const handleVerify = (docId: string, status: 'verified' | 'rejected') => {
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === docId ? { ...doc, status } : doc
      )
    );
    toast({
      title: status === 'verified' ? "Document approuvé" : "Document rejeté",
      description: `Le document a été ${status === 'verified' ? 'approuvé' : 'rejeté'}`
    });
  };

  const requiredDocs = documents.filter(doc => doc.required);
  const verifiedRequired = requiredDocs.filter(doc => doc.status === 'verified');
  const completionPercentage = requiredDocs.length > 0 ? (verifiedRequired.length / requiredDocs.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble des documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents Douaniers
          </CardTitle>
          <CardDescription>
            Gestion des documents requis pour les expéditions internationales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{documents.length}</div>
              <div className="text-sm text-muted-foreground">Total Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{verifiedRequired.length}</div>
              <div className="text-sm text-muted-foreground">Approuvés Requis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {documents.filter(doc => doc.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">En Attente</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression Documents Requis</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="manage">Gestion</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Nouvel Upload</CardTitle>
              <CardDescription>
                Uploadez les documents douaniers requis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doc-type">Type de Document</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="">Sélectionner le type</option>
                    <option value="invoice">Facture Commerciale</option>
                    <option value="certificate">Certificat d'Origine</option>
                    <option value="packing_list">Liste de Colisage</option>
                    <option value="customs_declaration">Déclaration Douanière</option>
                    <option value="insurance">Certificat d'Assurance</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="shipment-ref">Référence Expédition</Label>
                  <Input id="shipment-ref" placeholder="INT-001" />
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Glissez-déposez vos fichiers ici ou
                </p>
                <Button variant="outline">
                  Parcourir les fichiers
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, JPG, PNG jusqu'à 10MB
                </p>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Upload en cours...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              <Button onClick={handleUpload} disabled={isUploading} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Upload en cours..." : "Uploader Document"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{doc.name}</h4>
                          {doc.required && (
                            <Badge variant="outline" className="text-xs">
                              Requis
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Uploadé le {doc.uploadedAt}</span>
                          <span>{doc.size}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(doc.status)}>
                        {getStatusIcon(doc.status)}
                        <span className="ml-1 capitalize">{doc.status}</span>
                      </Badge>

                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        {doc.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVerify(doc.id, 'verified')}
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVerify(doc.id, 'rejected')}
                            >
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Modèles de Documents</CardTitle>
              <CardDescription>
                Téléchargez les modèles officiels pour vos expéditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: "Facture Commerciale", desc: "Modèle standard pour factures d'exportation" },
                  { name: "Certificat d'Origine", desc: "Formulaire officiel certificat d'origine" },
                  { name: "Liste de Colisage", desc: "Détail du contenu des colis" },
                  { name: "Déclaration Douanière", desc: "Formulaire déclaration en douane" }
                ].map((template, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.desc}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
