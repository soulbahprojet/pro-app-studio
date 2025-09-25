import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) throw new Error('User not authenticated');

    if (req.method === 'POST') {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const productData = JSON.parse(formData.get('productData') as string);

      if (!file) throw new Error('No file provided');

      // Validate file type and size
      const allowedTypes = [
        'application/pdf',
        'application/zip',
        'application/x-zip-compressed',
        'image/jpeg',
        'image/png',
        'audio/mpeg',
        'video/mp4',
        'text/plain',
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not allowed');
      }

      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        throw new Error('File too large (max 100MB)');
      }

      // Generate secure filename
      const fileExtension = file.name.split('.').pop();
      const secureFileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('digital-products')
        .upload(secureFileName, file);

      if (uploadError) throw uploadError;

      // Get signed URL for download
      const { data: urlData } = await supabaseClient.storage
        .from('digital-products')
        .createSignedUrl(secureFileName, 60 * 60 * 24 * 365); // 1 year expiry

      // Create digital product record
      const { data: product, error: productError } = await supabaseClient
        .from('products')
        .insert({
          ...productData,
          seller_id: user.id,
          type: 'digital',
          digital_file_url: uploadData.path,
          is_active: true,
        })
        .select()
        .single();

      if (productError) throw productError;

      return new Response(JSON.stringify({
        product,
        file_url: urlData?.signedUrl,
        message: 'Digital product uploaded successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    if (req.method === 'GET') {
      // Get digital product download link
      const url = new URL(req.url);
      const productId = url.searchParams.get('product_id');
      const accessToken = url.searchParams.get('access_token');

      if (!productId || !accessToken) {
        throw new Error('Product ID and access token required');
      }

      // Verify digital access
      const { data: access, error: accessError } = await supabaseClient
        .from('digital_access')
        .select('*, products(*)')
        .eq('product_id', productId)
        .eq('access_token', accessToken)
        .eq('customer_id', user.id)
        .single();

      if (accessError || !access) {
        throw new Error('Invalid access token or product not found');
      }

      // Check download limits
      if (access.download_limit && access.download_count >= access.download_limit) {
        throw new Error('Download limit exceeded');
      }

      // Check expiry
      if (access.expires_at && new Date(access.expires_at) < new Date()) {
        throw new Error('Access expired');
      }

      // Increment download count
      await supabaseClient
        .from('digital_access')
        .update({ download_count: access.download_count + 1 })
        .eq('id', access.id);

      // Get signed download URL
      const { data: downloadUrl } = await supabaseClient.storage
        .from('digital-products')
        .createSignedUrl(access.products.digital_file_url, 300); // 5 minutes

      return new Response(JSON.stringify({
        download_url: downloadUrl?.signedUrl,
        remaining_downloads: access.download_limit ? access.download_limit - access.download_count - 1 : null,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    console.error('Digital upload API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});