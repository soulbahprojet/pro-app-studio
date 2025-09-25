import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Image, Music, Video, Archive, Clock, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { Product, DigitalAccess } from '@/types';

interface ClientDigitalDownloadsProps {
  userId: string;
}

interface PurchasedDigitalProduct {
  product: Product;
  access: DigitalAccess;
  orderDate: string;
}

const ClientDigitalDownloads: React.FC<ClientDigitalDownloadsProps> = ({ userId }) => {
  const { toast } = useToast();
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedDigitalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Simulation des produits numériques achetés
  useEffect(() => {
    const loadPurchasedProducts = async () => {
      setLoading(true);
      
      // En production : récupérer depuis Supabase
      // SELECT * FROM digital_access WHERE userId = ?
      // JOIN products ON digital_access.productId = products.id
      
      // Données simulées
      const mockPurchases: PurchasedDigitalProduct[] = [
        {
          product: {
            id: 'prod_1',
            sellerId: 'seller_1',
            name: 'Guide Complet du Marketing Digital',
            description: 'Un guide PDF de 150 pages pour maîtriser le marketing digital en Guinée',
            price: { amount: 50000, currency: 'GNF' },
            stock: 99999,
            images: [],
            attributes: {},
            status: 'active',
            type: 'digital',
            digital: {
              fileKey: 'digital/marketing-guide.pdf',
              fileName: 'Marketing-Digital-Guide.pdf',
              fileSize: 5242880, // 5MB
              mimeType: 'application/pdf',
              downloadLimit: 3,
              downloadsCount: 1,
              requiresWatermark: true
            },
            createdAt: '2024-01-15T10:00:00Z'
          },
          access: {
            id: 'access_1',
            orderId: 'order_123',
            userId,
            productId: 'prod_1',
            downloadsLeft: 2,
            createdAt: '2024-01-15T10:30:00Z'
          },
          orderDate: '2024-01-15T10:30:00Z'
        },
        {
          product: {
            id: 'prod_2',
            sellerId: 'seller_2',
            name: 'Pack Audio - Musique Traditionnelle Guinéenne',
            description: 'Collection de 20 morceaux traditionnels en haute qualité',
            price: { amount: 25000, currency: 'GNF' },
            stock: 99999,
            images: [],
            attributes: {},
            status: 'active',
            type: 'digital',
            digital: {
              fileKey: 'digital/music-pack.zip',
              fileName: 'Musique-Traditionnelle-Pack.zip',
              fileSize: 157286400, // 150MB
              mimeType: 'application/zip',
              downloadLimit: 5,
              downloadsCount: 0,
              requiresWatermark: false
            },
            createdAt: '2024-01-14T15:20:00Z'
          },
          access: {
            id: 'access_2',
            orderId: 'order_124',
            userId,
            productId: 'prod_2',
            downloadsLeft: 5,
            createdAt: '2024-01-14T15:30:00Z'
          },
          orderDate: '2024-01-14T15:30:00Z'
        }
      ];
      
      setTimeout(() => {
        setPurchasedProducts(mockPurchases);
        setLoading(false);
      }, 1000);
    };

    loadPurchasedProducts();
  }, [userId]);

  const getFileIcon = (mimeType: string) => {
    const iconMap = {
      'application/pdf': { icon: FileText, color: 'text-red-600' },
      'application/epub+zip': { icon: FileText, color: 'text-blue-600' },
      'application/zip': { icon: Archive, color: 'text-gray-600' },
      'audio/mpeg': { icon: Music, color: 'text-green-600' },
      'audio/mp3': { icon: Music, color: 'text-green-600' },
      'video/mp4': { icon: Video, color: 'text-purple-600' },
      'image/png': { icon: Image, color: 'text-blue-500' },
      'image/jpeg': { icon: Image, color: 'text-blue-500' },
    };
    
    const iconInfo = iconMap[mimeType as keyof typeof iconMap] || { icon: FileText, color: 'text-gray-500' };
    const Icon = iconInfo.icon;
    return <Icon className={`w-6 h-6 ${iconInfo.color}`} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateDownloadLink = async (productId: string) => {
    setDownloadingId(productId);
    
    try {
      // En production : appel à l'edge function Supabase
      // const { data } = await supabase.functions.invoke('generate-download-link', {
      //   body: { userId, productId }
      // });
      
      // Simulation de génération de lien
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simuler la réponse avec un lien de téléchargement
      const downloadUrl = `https://votre-app.com/api/digital/download?token=eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ userId, productId, exp: Date.now() + 24*60*60*1000 }))}`;
      
      // Ouvrir le téléchargement
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = purchasedProducts.find(p => p.product.id === productId)?.product.digital?.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Décrémenter les téléchargements restants
      setPurchasedProducts(prev => 
        prev.map(item => 
          item.product.id === productId 
            ? { ...item, access: { ...item.access, downloadsLeft: item.access.downloadsLeft - 1 } }
            : item
        )
      );
      
      toast({
        title: "Téléchargement démarré",
        description: "Le fichier est en cours de téléchargement.",
      });
      
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de générer le lien de téléchargement.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (purchasedProducts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Download className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun produit numérique</h3>
          <p className="text-muted-foreground">
            Vous n'avez pas encore acheté de produits numériques.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mes Produits Numériques</h2>
        <Badge variant="outline">{purchasedProducts.length} produit(s)</Badge>
      </div>
      
      <div className="space-y-4">
        {purchasedProducts.map((item) => (
          <Card key={item.product.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getFileIcon(item.product.digital?.mimeType || '')}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {item.product.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                        <span>Acheté le {formatDate(item.orderDate)}</span>
                        <span>•</span>
                        <span>{formatFileSize(item.product.digital?.fileSize || 0)}</span>
                        <span>•</span>
                        <span>{item.product.digital?.fileName}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={item.access.downloadsLeft > 0 ? "default" : "secondary"}>
                          {item.access.downloadsLeft} téléchargement(s) restant(s)
                        </Badge>
                        
                        {item.product.digital?.requiresWatermark && (
                          <Badge variant="outline" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            Watermark
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {item.product.price.amount.toLocaleString()} {item.product.price.currency}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => generateDownloadLink(item.product.id)}
                        disabled={item.access.downloadsLeft <= 0 || downloadingId === item.product.id}
                        variant={item.access.downloadsLeft > 0 ? "hero" : "outline"}
                        size="sm"
                      >
                        {downloadingId === item.product.id ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Génération...
                          </>
                        ) : item.access.downloadsLeft > 0 ? (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Limite atteinte
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Informations de sécurité */}
              {item.access.downloadsLeft <= 1 && item.access.downloadsLeft > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <p className="text-sm text-amber-800">
                      <strong>Attention :</strong> Il vous reste seulement {item.access.downloadsLeft} téléchargement pour ce produit.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Informations sur la sécurité */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-2">Protection & Sécurité</p>
              <ul className="text-blue-700 space-y-1">
                <li>• Liens de téléchargement sécurisés et expirables (24h)</li>
                <li>• Limitation du nombre de téléchargements par achat</li>
                <li>• Fichiers protégés par watermark quand applicable</li>
                <li>• Accès permanent tant que vous respectez les limites</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDigitalDownloads;