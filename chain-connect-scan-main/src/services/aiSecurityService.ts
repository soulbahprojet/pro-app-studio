/**
 * Service IA Sécurité 224SOLUTIONS - Version simplifiée
 * Analyse comportements suspects et prend décisions automatiques
 */

import { supabase } from '@/integrations/supabase/client';

// Types simplifiés basés sur les tables existantes
export interface SecurityEvent {
  id?: string;
  user_id?: string;
  event_type: 'login_attempt' | 'login_failure' | 'suspicious_transaction' | 'unusual_activity';
  description: string;
  metadata?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  created_at?: string;
}

export interface AIAnalysisResult {
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  threats_detected: string[];
  explanation: string;
  recommended_actions: string[];
}

class AISecurityService {
  
  /**
   * Analyser un événement de sécurité avec IA
   */
  async analyzeSecurityEvent(event: SecurityEvent): Promise<AIAnalysisResult> {
    try {
      // Calculer le score de risque de base
      const riskScore = this.calculateRiskScore(event);
      
      // Déterminer le niveau de risque
      const riskLevel = this.getRiskLevel(riskScore);
      
      // Détecter les menaces
      const threats = this.detectThreats(event);
      
      // Générer recommandations
      const actions = this.generateRecommendations(riskLevel, threats);

      const result: AIAnalysisResult = {
        risk_level: riskLevel,
        confidence: Math.min(95, Math.max(60, riskScore)),
        threats_detected: threats,
        explanation: this.generateExplanation(event, riskLevel, threats, riskScore),
        recommended_actions: actions
      };

      // Sauvegarder l'analyse dans security_alerts (table existante)
      await this.saveSecurityAlert(event, result);

      return result;

    } catch (error) {
      console.error('Erreur analyse IA sécurité:', error);
      return {
        risk_level: 'medium',
        confidence: 50,
        threats_detected: ['analysis_error'],
        explanation: 'Erreur lors de l\'analyse IA, surveillance manuelle recommandée',
        recommended_actions: ['Contact admin']
      };
    }
  }

  /**
   * Traiter automatiquement un événement de sécurité
   */
  async processSecurityEventAuto(event: SecurityEvent): Promise<{ success: boolean, message: string }> {
    try {
      const analysis = await this.analyzeSecurityEvent(event);
      
      // Prendre des actions selon le niveau de risque
      if (analysis.risk_level === 'critical' || analysis.risk_level === 'high') {
        await this.sendSecurityAlert(event, analysis);
        return { 
          success: true, 
          message: `Alerte de sécurité créée - Risque ${analysis.risk_level}` 
        };
      }

      return { 
        success: true, 
        message: `Événement analysé - Risque ${analysis.risk_level}` 
      };

    } catch (error) {
      console.error('Erreur traitement automatique:', error);
      return { 
        success: false, 
        message: 'Erreur lors du traitement automatique' 
      };
    }
  }

  /**
   * Calculer score de risque simple
   */
  private calculateRiskScore(event: SecurityEvent): number {
    let score = 0;

    switch (event.event_type) {
      case 'login_failure':
        score += 30;
        break;
      case 'suspicious_transaction':
        score += 60;
        break;
      case 'unusual_activity':
        score += 40;
        break;
      default:
        score += 20;
    }

    // Facteurs additionnels
    if (event.metadata?.amount && event.metadata.amount > 1000000) {
      score += 30;
    }

    if (event.metadata?.attempts && event.metadata.attempts > 3) {
      score += event.metadata.attempts * 10;
    }

    return Math.min(100, score);
  }

  /**
   * Déterminer niveau de risque
   */
  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  /**
   * Détecter menaces spécifiques
   */
  private detectThreats(event: SecurityEvent): string[] {
    const threats: string[] = [];

    if (event.event_type === 'login_failure' && event.metadata?.attempts > 5) {
      threats.push('Tentatives de connexion répétées');
    }

    if (event.event_type === 'suspicious_transaction') {
      if (event.metadata?.amount > 5000000) {
        threats.push('Transaction de montant élevé');
      }
    }

    if (event.metadata?.unusual_time) {
      threats.push('Activité à heure inhabituelle');
    }

    if (event.metadata?.new_device) {
      threats.push('Nouveau dispositif détecté');
    }

    return threats;
  }

  /**
   * Générer recommandations
   */
  private generateRecommendations(riskLevel: string, threats: string[]): string[] {
    const actions: string[] = [];

    switch (riskLevel) {
      case 'critical':
        actions.push('Bloquer l\'utilisateur immédiatement');
        actions.push('Notifier l\'équipe sécurité');
        actions.push('Analyser l\'activité récente');
        break;
      case 'high':
        actions.push('Suspendre temporairement l\'utilisateur');
        actions.push('Demander vérification supplémentaire');
        actions.push('Surveiller l\'activité');
        break;
      case 'medium':
        actions.push('Surveiller l\'utilisateur');
        actions.push('Demander vérification si nécessaire');
        break;
      case 'low':
        actions.push('Surveillance de routine');
        break;
    }

    return actions;
  }

  /**
   * Générer explication
   */
  private generateExplanation(event: SecurityEvent, riskLevel: string, threats: string[], score: number): string {
    let explanation = `Événement "${event.event_type}" analysé avec un score de risque de ${score}/100 (${riskLevel}). `;
    
    if (threats.length > 0) {
      explanation += `Menaces détectées: ${threats.join(', ')}. `;
    }

    const riskExplanations = {
      low: 'Activité normale, surveillance de routine recommandée.',
      medium: 'Activité modérément suspecte, vérification recommandée.',
      high: 'Activité hautement suspecte, actions immédiates requises.',
      critical: 'Menace critique détectée, blocage automatique recommandé.'
    };

    explanation += riskExplanations[riskLevel as keyof typeof riskExplanations] || '';
    
    return explanation;
  }

  /**
   * Sauvegarder alerte de sécurité
   */
  private async saveSecurityAlert(event: SecurityEvent, analysis: AIAnalysisResult): Promise<void> {
    try {
      await supabase
        .from('security_alerts')
        .insert({
          alert_type: event.event_type,
          severity: analysis.risk_level,
          user_id: event.user_id || 'unknown',
          message: analysis.explanation,
          is_resolved: false,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erreur sauvegarde alerte:', error);
    }
  }

  /**
   * Envoyer alerte de sécurité
   */
  private async sendSecurityAlert(event: SecurityEvent, analysis: AIAnalysisResult): Promise<void> {
    try {
      // Utiliser l'edge function notifications pour envoyer l'alerte
      await supabase.functions.invoke('notifications', {
        body: {
          action: 'send_security_alert',
          userIds: ['admin'], // Envoyer aux admins
          alertData: {
            type: event.event_type,
            message: analysis.explanation,
            severity: analysis.risk_level
          }
        }
      });
    } catch (error) {
      console.error('Erreur envoi alerte:', error);
    }
  }

  /**
   * Logger un événement de sécurité simple
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Analyser et traiter automatiquement
      const result = await this.processSecurityEventAuto(event);
      console.log('Événement sécurité traité:', result.message);
    } catch (error) {
      console.error('Erreur log événement sécurité:', error);
    }
  }

  /**
   * Obtenir les alertes récentes
   */
  async getRecentAlerts(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur récupération alertes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur récupération alertes:', error);
      return [];
    }
  }

  /**
   * Marquer une alerte comme résolue
   */
  async resolveAlert(alertId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({ 
          is_resolved: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      return !error;
    } catch (error) {
      console.error('Erreur résolution alerte:', error);
      return false;
    }
  }
}

export const aiSecurityService = new AISecurityService();