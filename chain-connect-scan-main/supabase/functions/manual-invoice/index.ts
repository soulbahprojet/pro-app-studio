import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceData {
  client_name: string;
  client_email: string;
  description: string;
  amount: number;
  currency: string;
  due_date?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Authentication required");
    }

    const { action, ...invoiceData } = await req.json();

    switch (action) {
      case "create_invoice": {
        const { client_name, client_email, description, amount, currency, due_date }: InvoiceData = invoiceData;

        // Generate invoice number
        const { data: invoiceNumberData, error: invoiceNumberError } = await supabaseService
          .rpc('generate_invoice_number');
        
        if (invoiceNumberError) {
          throw new Error("Failed to generate invoice number");
        }

        const invoiceNumber = invoiceNumberData;

        // Generate simple PDF content (basic HTML to PDF approach)
        const pdfContent = generateInvoicePDF({
          invoice_number: invoiceNumber,
          client_name,
          client_email,
          description,
          amount,
          currency: currency || 'GNF',
          due_date,
          created_at: new Date().toLocaleDateString('fr-FR')
        });

        // For now, we'll store the HTML content as PDF URL (in a real implementation, you'd use a proper PDF library)
        const pdfUrl = `data:text/html;base64,${btoa(pdfContent)}`;

        // Insert invoice into database
        const { data: invoice, error: insertError } = await supabaseService
          .from('manual_invoices')
          .insert({
            seller_id: user.id,
            client_name,
            client_email,
            description,
            amount,
            currency: currency || 'GNF',
            invoice_number: invoiceNumber,
            pdf_url: pdfUrl,
            due_date: due_date || null,
            status: 'draft'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error("Failed to create invoice");
        }

        return new Response(JSON.stringify({
          success: true,
          invoice,
          pdf_content: pdfContent
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_invoices": {
        const { data: invoices, error: fetchError } = await supabaseService
          .from('manual_invoices')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw new Error("Failed to fetch invoices");
        }

        return new Response(JSON.stringify({
          success: true,
          invoices
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_status": {
        const { invoice_id, status } = invoiceData;

        const { data: invoice, error: updateError } = await supabaseService
          .from('manual_invoices')
          .update({ status })
          .eq('id', invoice_id)
          .eq('seller_id', user.id)
          .select()
          .single();

        if (updateError) {
          throw new Error("Failed to update invoice status");
        }

        return new Response(JSON.stringify({
          success: true,
          invoice
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error("Invalid action");
    }

  } catch (error) {
    console.error('Error in manual-invoice function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateInvoicePDF(invoice: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Facture ${invoice.invoice_number}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; }
        .invoice-title { font-size: 28px; font-weight: bold; color: #2563eb; }
        .invoice-number { font-size: 18px; margin-top: 10px; }
        .section { margin: 30px 0; }
        .label { font-weight: bold; color: #666; }
        .value { margin-left: 20px; }
        .amount { font-size: 24px; font-weight: bold; color: #059669; text-align: right; }
        .footer { margin-top: 60px; text-align: center; color: #666; font-size: 12px; }
        .divider { border-top: 2px solid #e5e7eb; margin: 30px 0; }
    </style>
</head>
<body>
    <div class="header">
        <div class="invoice-title">FACTURE</div>
        <div class="invoice-number">${invoice.invoice_number}</div>
    </div>
    
    <div class="section">
        <div class="label">Client:</div>
        <div class="value">${invoice.client_name}</div>
        <div class="value">${invoice.client_email}</div>
    </div>
    
    <div class="section">
        <div class="label">Description:</div>
        <div class="value">${invoice.description || 'Aucune description'}</div>
    </div>
    
    ${invoice.due_date ? `
    <div class="section">
        <div class="label">Date d'échéance:</div>
        <div class="value">${new Date(invoice.due_date).toLocaleDateString('fr-FR')}</div>
    </div>
    ` : ''}
    
    <div class="divider"></div>
    
    <div class="amount">
        Montant: ${invoice.amount} ${invoice.currency}
    </div>
    
    <div class="footer">
        <p>Facture générée le ${invoice.created_at}</p>
        <p>Système de facturation 224Solutions</p>
    </div>
</body>
</html>
  `;
}