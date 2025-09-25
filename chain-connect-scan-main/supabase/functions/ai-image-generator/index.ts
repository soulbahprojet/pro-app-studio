import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user from JWT token directly
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!hfToken) {
      console.error('HUGGING_FACE_ACCESS_TOKEN not found');
      return new Response(
        JSON.stringify({ error: 'Hugging Face access token not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { title, description } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Product title is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create a detailed prompt for product image generation
    let prompt = `Create a high-quality, realistic product photo of: ${title}`;
    
    if (description) {
      prompt += `. Additional details: ${description}`;
    }
    
    prompt += `. The image should be professional, well-lit, with a clean background suitable for e-commerce. The product should be the main focus, displayed clearly and attractively. Ultra high resolution, commercial photography style.`;

    console.log('Generating image with prompt:', prompt);

    // Initialize Hugging Face inference
    const hf = new HfInference(hfToken);

    console.log('Calling Hugging Face API...');

    // Generate image using FLUX.1-schnell
    const image = await hf.textToImage({
      inputs: prompt,
      model: 'black-forest-labs/FLUX.1-schnell',
    });

    console.log('Image generated successfully from Hugging Face');

    // Convert the blob to array buffer
    const arrayBuffer = await image.arrayBuffer();
    const imageBuffer = new Uint8Array(arrayBuffer);
    const fileName = `ai-generated/${user.id}/${Date.now()}_product.png`;

    console.log('Uploading image to storage:', fileName);

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('product-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from('product-images')
      .getPublicUrl(fileName);

    console.log('Image uploaded successfully:', urlData.publicUrl);

    return new Response(
      JSON.stringify({ 
        imageUrl: urlData.publicUrl,
        message: 'Image generated successfully'
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in ai-image-generator function:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate image';
    let errorDetails = error.message;
    
    if (error.message && error.message.includes('API key')) {
      errorMessage = 'Invalid Hugging Face API key';
      errorDetails = 'Please verify your Hugging Face access token is valid and has the necessary permissions.';
    } else if (error.message && error.message.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded';
      errorDetails = 'Too many requests. Please wait a moment and try again.';
    } else if (error.message && error.message.includes('model')) {
      errorMessage = 'Model not available';
      errorDetails = 'The image generation model is temporarily unavailable.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage, 
        details: errorDetails,
        originalError: error.message
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});