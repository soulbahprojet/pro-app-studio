-- Fix security definer function by adding proper search_path
CREATE OR REPLACE FUNCTION public.calculate_commission(p_user_id uuid, p_transaction_amount numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$