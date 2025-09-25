// Simulation d'envoi SMS - Remplacer par une vraie API comme Twilio
export async function sendSMS(message: string, phone?: string): Promise<boolean> {
  console.log(`📱 SMS Simulé vers ${phone || 'PDG'}: ${message}`);
  
  // Pour une vraie implémentation avec Twilio:
  /*
  try {
    const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa('YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: 'YOUR_TWILIO_PHONE',
        To: phone || 'YOUR_PDG_PHONE',
        Body: message,
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Erreur envoi SMS:', error);
    return false;
  }
  */
  
  // Simulation réussie
  return true;
}

export async function sendWhatsApp(message: string, phone?: string): Promise<boolean> {
  console.log(`💬 WhatsApp Simulé vers ${phone || 'PDG'}: ${message}`);
  
  // Pour une vraie implémentation avec WhatsApp Business API:
  /*
  try {
    const response = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone || 'YOUR_PDG_PHONE',
        type: 'text',
        text: { body: message }
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Erreur envoi WhatsApp:', error);
    return false;
  }
  */
  
  // Simulation réussie
  return true;
}

export async function requestApproval(
  action: string, 
  details: string, 
  method: 'sms' | 'whatsapp' = 'sms'
): Promise<boolean> {
  const message = `🤖 Copilote PDG - Approbation requise:
Action: ${action}
Détails: ${details}
Répondez OUI pour approuver, NON pour refuser.`;

  if (method === 'whatsapp') {
    return await sendWhatsApp(message);
  } else {
    return await sendSMS(message);
  }
}

// Simuler une réponse d'approbation (dans une vraie app, ceci viendrait d'un webhook)
export function simulateApprovalResponse(): 'OUI' | 'NON' | 'PENDING' {
  const responses: ('OUI' | 'NON' | 'PENDING')[] = ['OUI', 'NON', 'PENDING'];
  return responses[Math.floor(Math.random() * responses.length)];
}