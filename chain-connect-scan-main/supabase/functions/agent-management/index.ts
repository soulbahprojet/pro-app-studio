import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateAgentRequest {
  name: string;
  email: string;
  phone?: string;
  agentType?: string;
  canCreateSubAgent?: boolean;
}

interface CreateSubAgentRequest {
  name: string;
  email: string;
  phone?: string;
  parentAgentId: string;
}

interface CreateUserRequest {
  name: string;
  email?: string;
  phone?: string;
  creatorId: string;
  creatorType: 'agent' | 'sub_agent';
  userType?: string;
}

interface ActivateUserRequest {
  inviteToken: string;
  deviceType: 'mobile' | 'pc';
}

interface ProcessTransactionRequest {
  userId: string;
  amount: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'create-agent': {
        const body: CreateAgentRequest = await req.json();
        
        // Check if user is PDG or admin
        const { data: pdgCheck, error: pdgError } = await supabase
          .from('admin_roles')
          .select('role_type')
          .eq('user_id', user.id)
          .in('role_type', ['pdg', 'admin']);

        const { data: profileCheck, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        // User must be either PDG in admin_roles OR admin in profiles
        const isPdgOrAdmin = (pdgCheck && pdgCheck.length > 0) || profileCheck?.role === 'admin';
        
        if (!isPdgOrAdmin) {
          return new Response(JSON.stringify({ error: 'Only PDG or admin users can create agents' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: agent, error } = await supabase
          .from('agents')
          .insert({
            pgd_id: user.id,
            name: body.name,
            email: body.email,
            phone: body.phone || null,
            can_create_sub_agent: body.canCreateSubAgent || false,
          })
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, agent }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'create-sub-agent': {
        const body: CreateSubAgentRequest = await req.json();

        // Check if parent agent exists and can create sub-agents
        const { data: parentAgent } = await supabase
          .from('agents')
          .select('*')
          .eq('id', body.parentAgentId)
          .eq('can_create_sub_agent', true)
          .single();

        if (!parentAgent) {
          return new Response(
            JSON.stringify({ error: 'Parent agent not found or not authorized to create sub-agents' }),
            {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { data: subAgent, error } = await supabase
          .from('sub_agents')
          .insert({
            parent_agent_id: body.parentAgentId,
            name: body.name,
            email: body.email,
            phone: body.phone,
          })
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, subAgent }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'create-user': {
        const body: CreateUserRequest = await req.json();

        // Generate invite token
        const inviteToken = crypto.randomUUID();
        const inviteLink = `https://10e539c2-bff3-4915-8cfd-e4213339deb6.lovableproject.com/invite/${inviteToken}`;

        const { data: newUser, error } = await supabase
          .from('agent_users')
          .insert({
            creator_id: body.creatorId,
            creator_type: body.creatorType,
            name: body.name,
            email: body.email,
            phone: body.phone,
            user_type: body.userType || 'client',
            invite_token: inviteToken,
          })
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // TODO: Send email/SMS with invite link
        console.log(`Invite link for ${body.name}: ${inviteLink}`);

        return new Response(JSON.stringify({ 
          success: true, 
          user: newUser, 
          inviteLink 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'activate-user': {
        const body: ActivateUserRequest = await req.json();

        const { data: userToActivate, error: findError } = await supabase
          .from('agent_users')
          .select('*')
          .eq('invite_token', body.inviteToken)
          .eq('status', 'invited')
          .single();

        if (findError || !userToActivate) {
          return new Response(JSON.stringify({ error: 'Invalid or expired invite token' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error: updateError } = await supabase
          .from('agent_users')
          .update({
            status: 'active',
            device_type: body.deviceType,
            activated_at: new Date().toISOString(),
          })
          .eq('id', userToActivate.id);

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const downloadUrl = body.deviceType === 'mobile'
          ? 'https://play.google.com/store/apps/details?id=com.224solutions.app'
          : 'https://10e539c2-bff3-4915-8cfd-e4213339deb6.lovableproject.com';

        return new Response(JSON.stringify({
          success: true,
          downloadUrl,
          user: userToActivate,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'process-transaction': {
        const body: ProcessTransactionRequest = await req.json();

        // Call the commission calculation function
        const { data: commissionResult, error } = await supabase
          .rpc('calculate_commission', {
            p_user_id: body.userId,
            p_transaction_amount: body.amount,
          });

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          success: true,
          commissions: commissionResult || [],
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-agents': {
        const { data: agents, error } = await supabase
          .from('agents')
          .select(`
            *,
            sub_agents(*)
          `)
          .eq('pgd_id', user.id);

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ agents }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-users': {
        const creatorId = url.searchParams.get('creatorId');
        const creatorType = url.searchParams.get('creatorType');

        let query = supabase.from('agent_users').select('*');

        if (creatorId && creatorType) {
          query = query.eq('creator_id', creatorId).eq('creator_type', creatorType);
        }

        const { data: users, error } = await query;

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ users }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-commissions': {
        const recipientId = url.searchParams.get('recipientId');
        const recipientType = url.searchParams.get('recipientType');

        let query = supabase.from('commissions').select('*');

        if (recipientId && recipientType) {
          query = query.eq('recipient_id', recipientId).eq('recipient_type', recipientType);
        }

        const { data: commissions, error } = await query;

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ commissions }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update-commission-settings': {
        const { base_commission, parent_share } = await req.json();

        const { data: settings, error } = await supabase
          .from('commission_settings')
          .upsert({
            pgd_id: user.id,
            base_user_commission: base_commission,
            parent_share_ratio: parent_share,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, settings }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Agent management error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});