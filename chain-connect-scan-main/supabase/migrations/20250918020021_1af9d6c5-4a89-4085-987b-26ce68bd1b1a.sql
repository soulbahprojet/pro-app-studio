-- Create agents table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pgd_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  can_create_sub_agent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sub_agents table
CREATE TABLE public.sub_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create agent_users table (users created by agents/sub-agents)
CREATE TABLE public.agent_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL, -- Can be agent_id or sub_agent_id
  creator_type TEXT NOT NULL CHECK (creator_type IN ('agent', 'sub_agent')),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  user_type TEXT DEFAULT 'client',
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'inactive')),
  invite_token TEXT UNIQUE,
  activated_at TIMESTAMP WITH TIME ZONE,
  device_type TEXT CHECK (device_type IN ('mobile', 'pc')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create commissions table
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL, -- agent_id or sub_agent_id
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('agent', 'sub_agent')),
  amount NUMERIC(10,2) NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('user', 'sub_agent_user')),
  source_user_id UUID REFERENCES public.agent_users(id),
  transaction_id UUID,
  commission_rate NUMERIC(5,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create commission_settings table
CREATE TABLE public.commission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pgd_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  base_user_commission NUMERIC(5,4) DEFAULT 0.20, -- 20%
  parent_share_ratio NUMERIC(5,4) DEFAULT 0.50, -- 50% split
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(pgd_id)
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agents
CREATE POLICY "PDG can manage their agents" ON public.agents
FOR ALL USING (is_pdg_user() OR pgd_id = auth.uid());

CREATE POLICY "Agents can view themselves" ON public.agents
FOR SELECT USING (auth.uid() IN (
  SELECT user_id FROM profiles WHERE user_id = auth.uid() AND email = agents.email
));

-- RLS Policies for sub_agents
CREATE POLICY "Agents can manage their sub-agents" ON public.sub_agents
FOR ALL USING (parent_agent_id IN (
  SELECT id FROM agents WHERE pgd_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND email = agents.email)
));

-- RLS Policies for agent_users
CREATE POLICY "Creators can manage their users" ON public.agent_users
FOR ALL USING (
  (creator_type = 'agent' AND creator_id IN (
    SELECT id FROM agents WHERE pgd_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND email = agents.email)
  )) OR
  (creator_type = 'sub_agent' AND creator_id IN (
    SELECT id FROM sub_agents WHERE 
    parent_agent_id IN (SELECT id FROM agents WHERE pgd_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND email = sub_agents.email)
  ))
);

-- RLS Policies for commissions
CREATE POLICY "Recipients can view their commissions" ON public.commissions
FOR SELECT USING (
  (recipient_type = 'agent' AND recipient_id IN (
    SELECT id FROM agents WHERE pgd_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND email = agents.email)
  )) OR
  (recipient_type = 'sub_agent' AND recipient_id IN (
    SELECT id FROM sub_agents WHERE 
    parent_agent_id IN (SELECT id FROM agents WHERE pgd_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND email = sub_agents.email)
  ))
);

-- RLS Policies for commission_settings
CREATE POLICY "PDG can manage commission settings" ON public.commission_settings
FOR ALL USING (is_pdg_user() OR pgd_id = auth.uid());

-- Create functions for agent management
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to calculate and distribute commissions
CREATE OR REPLACE FUNCTION public.calculate_commission(
  p_user_id UUID,
  p_transaction_amount NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  v_user RECORD;
  v_agent RECORD;
  v_sub_agent RECORD;
  v_settings RECORD;
  v_base_commission NUMERIC;
  v_parent_share NUMERIC;
  v_agent_amount NUMERIC;
  v_sub_agent_amount NUMERIC;
  v_parent_amount NUMERIC;
  v_result JSONB := '[]'::jsonb;
BEGIN
  -- Get user info
  SELECT * INTO v_user FROM agent_users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN '[]'::jsonb;
  END IF;

  -- Get commission settings
  SELECT * INTO v_settings FROM commission_settings WHERE pgd_id = (
    CASE 
      WHEN v_user.creator_type = 'agent' THEN 
        (SELECT pgd_id FROM agents WHERE id = v_user.creator_id)
      WHEN v_user.creator_type = 'sub_agent' THEN 
        (SELECT a.pgd_id FROM agents a 
         JOIN sub_agents sa ON sa.parent_agent_id = a.id 
         WHERE sa.id = v_user.creator_id)
    END
  );
  
  v_base_commission := COALESCE(v_settings.base_user_commission, 0.20);
  v_parent_share := COALESCE(v_settings.parent_share_ratio, 0.50);

  IF v_user.creator_type = 'agent' THEN
    -- User created by agent - agent gets full commission
    v_agent_amount := p_transaction_amount * v_base_commission;
    
    INSERT INTO commissions (recipient_id, recipient_type, amount, source_type, source_user_id, commission_rate)
    VALUES (v_user.creator_id, 'agent', v_agent_amount, 'user', p_user_id, v_base_commission);
    
    v_result := jsonb_build_array(
      jsonb_build_object('recipient_id', v_user.creator_id, 'type', 'agent', 'amount', v_agent_amount)
    );
    
  ELSIF v_user.creator_type = 'sub_agent' THEN
    -- User created by sub-agent - split commission
    v_sub_agent_amount := p_transaction_amount * v_base_commission * (1 - v_parent_share);
    v_parent_amount := p_transaction_amount * v_base_commission * v_parent_share;
    
    -- Commission for sub-agent
    INSERT INTO commissions (recipient_id, recipient_type, amount, source_type, source_user_id, commission_rate)
    VALUES (v_user.creator_id, 'sub_agent', v_sub_agent_amount, 'sub_agent_user', p_user_id, v_base_commission * (1 - v_parent_share));
    
    -- Commission for parent agent
    SELECT parent_agent_id INTO v_agent FROM sub_agents WHERE id = v_user.creator_id;
    INSERT INTO commissions (recipient_id, recipient_type, amount, source_type, source_user_id, commission_rate)
    VALUES (v_agent.parent_agent_id, 'agent', v_parent_amount, 'sub_agent_user', p_user_id, v_base_commission * v_parent_share);
    
    v_result := jsonb_build_array(
      jsonb_build_object('recipient_id', v_user.creator_id, 'type', 'sub_agent', 'amount', v_sub_agent_amount),
      jsonb_build_object('recipient_id', v_agent.parent_agent_id, 'type', 'agent', 'amount', v_parent_amount)
    );
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;