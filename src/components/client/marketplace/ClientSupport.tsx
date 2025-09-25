import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import {
  HelpCircle,
  MessageSquare,
  Flag,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  Search,
  Star,
  User
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'resolved' | 'pending';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastResponse: string;
}

const ClientSupport: React.FC = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: '',
    message: '',
    priority: 'medium'
  });
  const [reportForm, setReportForm] = useState({
    type: '',
    productId: '',
    sellerId: '',
    reason: '',
    description: ''
  });

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'Comment passer une commande ?',
      answer: 'Pour passer une commande, naviguez dans le catalogue, ajoutez les produits à votre panier, puis procédez au paiement. Vous pouvez payer par Mobile Money, carte bancaire ou code marchand.',
      category: 'commande'
    },
    {
      id: '2',
      question: 'Quels sont les modes de paiement acceptés ?',
      answer: 'Nous acceptons Orange Money, MTN Money, Moov Money, les cartes Visa/Mastercard et le paiement par code marchand sur place.',
      category: 'paiement'
    },
    {
      id: '3',
      question: 'Comment suivre ma livraison ?',
      answer: 'Après confirmation de votre commande, vous recevrez un lien de suivi GPS. Vous pouvez aussi suivre votre commande dans la section "Livraison" de votre compte.',
      category: 'livraison'
    },
    {
      id: '4',
      question: 'Puis-je annuler ma commande ?',
      answer: 'Vous pouvez annuler votre commande avant le paiement final. Une fois le paiement effectué, contactez le vendeur directement pour toute modification.',
      category: 'commande'
    },
    {
      id: '5',
      question: 'Comment contacter un vendeur ?',
      answer: 'Sur la fiche produit, cliquez sur "Contacter le vendeur". Vous pouvez aussi utiliser la messagerie intégrée dans votre espace client.',
      category: 'vendeur'
    }
  ];

  const supportTickets: SupportTicket[] = [
    {
      id: 'TKT-001',
      subject: 'Problème de livraison',
      status: 'open',
      priority: 'high',
      createdAt: '2024-01-15',
      lastResponse: 'il y a 2 heures'
    },
    {
      id: 'TKT-002',
      subject: 'Question sur le paiement',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-01-10',
      lastResponse: 'il y a 3 jours'
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: 'bg-red-100 text-red-800', text: 'Ouvert', icon: AlertTriangle },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'En attente', icon: Clock },
      resolved: { color: 'bg-green-100 text-green-800', text: 'Résolu', icon: CheckCircle }
    };
    
    const config = statusConfig[status];
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    
    const priorityText = {
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Haute'
    };
    
    return (
      <Badge className={priorityColors[priority]}>
        {priorityText[priority]}
      </Badge>
    );
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    // Logique d'envoi du formulaire
    setContactForm({ subject: '', category: '', message: '', priority: 'medium' });
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Report form submitted:', reportForm);
    // Logique d'envoi du signalement
    setReportForm({ type: '', productId: '', sellerId: '', reason: '', description: '' });
  };

  return (
    <div className="space-y-6">
      {/* En-tête Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Support & Assistance
          </CardTitle>
          <p className="text-muted-foreground">
            Nous sommes là pour vous aider. Trouvez des réponses à vos questions ou contactez-nous directement.
          </p>
        </CardHeader>
      </Card>

      {/* Contacts rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Phone className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold">Téléphone</h3>
            <p className="text-sm text-muted-foreground">+224 620 00 00 00</p>
            <p className="text-xs text-muted-foreground">Lun-Ven 8h-18h</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold">Chat en direct</h3>
            <p className="text-sm text-muted-foreground">Assistance immédiate</p>
            <p className="text-xs text-muted-foreground">Disponible 24h/7j</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Mail className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold">Email</h3>
            <p className="text-sm text-muted-foreground">support@224solutions.com</p>
            <p className="text-xs text-muted-foreground">Réponse sous 24h</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="tickets">Mes demandes</TabsTrigger>
          <TabsTrigger value="report">Signaler</TabsTrigger>
        </TabsList>

        {/* FAQ */}
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Questions fréquemment posées</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher dans la FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQ.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {filteredFAQ.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune réponse trouvée pour votre recherche.</p>
                  <Button className="mt-4" onClick={() => setActiveTab('contact')}>
                    Contactez-nous
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contactez notre équipe</CardTitle>
              <p className="text-muted-foreground">
                Décrivez votre problème et nous vous répondrons rapidement.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Sujet *</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Résumé de votre demande"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <select
                      id="category"
                      value={contactForm.category}
                      onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      <option value="commande">Commande</option>
                      <option value="paiement">Paiement</option>
                      <option value="livraison">Livraison</option>
                      <option value="technique">Problème technique</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priorité</Label>
                  <select
                    id="priority"
                    value={contactForm.priority}
                    onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Décrivez votre problème en détail..."
                    rows={6}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer ma demande
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mes demandes */}
        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Mes demandes de support</CardTitle>
            </CardHeader>
            <CardContent>
              {supportTickets.length > 0 ? (
                <div className="space-y-4">
                  {supportTickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{ticket.subject}</h4>
                          <p className="text-sm text-muted-foreground">#{ticket.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Créé le {ticket.createdAt}</span>
                        <span>Dernière réponse: {ticket.lastResponse}</span>
                      </div>
                      <div className="mt-3">
                        <Button variant="outline" size="sm">
                          Voir les détails
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune demande de support pour le moment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signaler */}
        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Signaler un problème
              </CardTitle>
              <p className="text-muted-foreground">
                Signalez un produit inapproprié, un vendeur suspect ou tout autre problème.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="reportType">Type de signalement *</Label>
                  <select
                    id="reportType"
                    value={reportForm.type}
                    onChange={(e) => setReportForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Sélectionnez le type</option>
                    <option value="product">Produit inapproprié</option>
                    <option value="seller">Vendeur suspect</option>
                    <option value="spam">Spam / Contenu indésirable</option>
                    <option value="fake">Produit contrefait</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="productId">ID Produit (optionnel)</Label>
                    <Input
                      id="productId"
                      value={reportForm.productId}
                      onChange={(e) => setReportForm(prev => ({ ...prev, productId: e.target.value }))}
                      placeholder="ex: PRD-12345"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sellerId">ID Vendeur (optionnel)</Label>
                    <Input
                      id="sellerId"
                      value={reportForm.sellerId}
                      onChange={(e) => setReportForm(prev => ({ ...prev, sellerId: e.target.value }))}
                      placeholder="ex: VDR-67890"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="reason">Raison du signalement *</Label>
                  <Input
                    id="reason"
                    value={reportForm.reason}
                    onChange={(e) => setReportForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Résumé du problème"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description détaillée *</Label>
                  <Textarea
                    id="description"
                    value={reportForm.description}
                    onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez le problème en détail, ajoutez des preuves si possible..."
                    rows={6}
                    required
                  />
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Les signalements abusifs peuvent entraîner des sanctions sur votre compte.
                  </p>
                </div>
                
                <Button type="submit" className="w-full">
                  <Flag className="w-4 h-4 mr-2" />
                  Envoyer le signalement
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientSupport;
