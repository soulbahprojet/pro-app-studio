import { supabase } from "@/integrations/supabase/client";

export interface ButtonCheckResult {
  button: string;
  status: 'ok' | 'error' | 'warning';
  suggestion: string;
  responseTime?: number;
}

export async function checkAllButtons(): Promise<ButtonCheckResult[]> {
  const buttons = [
    'generateImage', 
    'saveStock', 
    'deleteItem',
    'createOrder',
    'processPayment',
    'sendNotification',
    'updateInventory',
    'generateReport'
  ];
  
  const report: ButtonCheckResult[] = [];

  for (const btn of buttons) {
    try {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('copilote', {
        body: { 
          action: 'check', 
          target: btn 
        }
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        report.push({ 
          button: btn, 
          status: 'error', 
          suggestion: `Erreur lors de la vérification: ${error.message}`,
          responseTime 
        });
      } else {
        report.push({ 
          button: btn, 
          status: data.status, 
          suggestion: data.aiSuggestion,
          responseTime 
        });
      }
    } catch (error) {
      report.push({ 
        button: btn, 
        status: 'error', 
        suggestion: `Exception: ${error.message}` 
      });
    }
  }

  // Afficher le rapport dans la console pour debug
  console.table(report);
  return report;
}

export async function checkSpecificButton(buttonId: string): Promise<ButtonCheckResult> {
  try {
    const startTime = Date.now();
    
    const { data, error } = await supabase.functions.invoke('copilote', {
      body: { 
        action: 'check', 
        target: buttonId 
      }
    });

    const responseTime = Date.now() - startTime;

    if (error) {
      return { 
        button: buttonId, 
        status: 'error', 
        suggestion: `Erreur: ${error.message}`,
        responseTime 
      };
    }

    return { 
      button: buttonId, 
      status: data.status, 
      suggestion: data.aiSuggestion,
      responseTime 
    };
  } catch (error) {
    return { 
      button: buttonId, 
      status: 'error', 
      suggestion: `Exception: ${error.message}` 
    };
  }
}