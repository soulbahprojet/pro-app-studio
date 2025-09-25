-- Corriger la fonction process_wallet_transfer pour utiliser les bons types d'enum
CREATE OR REPLACE FUNCTION public.process_wallet_transfer(
  p_sender_id uuid, 
  p_recipient_id uuid, 
  p_amount numeric, 
  p_currency text, 
  p_fee numeric, 
  p_reference text, 
  p_purpose text DEFAULT 'transfer'::text, 
  p_description text DEFAULT 'Transfert entre utilisateurs'::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_sender_wallet_id UUID;
  v_recipient_wallet_id UUID;
  v_balance_field TEXT;
  v_sender_balance NUMERIC;
  v_recipient_balance NUMERIC;
BEGIN
  -- Get wallet IDs
  SELECT id INTO v_sender_wallet_id FROM wallets WHERE user_id = p_sender_id;
  SELECT id INTO v_recipient_wallet_id FROM wallets WHERE user_id = p_recipient_id;
  
  IF v_sender_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Sender wallet not found';
  END IF;
  
  IF v_recipient_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Recipient wallet not found';
  END IF;
  
  -- Construct balance field name
  v_balance_field := 'balance_' || lower(p_currency);
  
  -- Get current balances
  EXECUTE format('SELECT %I FROM wallets WHERE id = %L', v_balance_field, v_sender_wallet_id) INTO v_sender_balance;
  EXECUTE format('SELECT %I FROM wallets WHERE id = %L', v_balance_field, v_recipient_wallet_id) INTO v_recipient_balance;
  
  -- Check sender balance
  IF v_sender_balance < (p_amount + p_fee) THEN
    RAISE EXCEPTION 'Insufficient balance. Required: %, Available: %', (p_amount + p_fee), v_sender_balance;
  END IF;
  
  -- Update sender balance (subtract amount + fee)
  EXECUTE format('UPDATE wallets SET %I = %I - %L WHERE id = %L', 
    v_balance_field, v_balance_field, (p_amount + p_fee), v_sender_wallet_id);
  
  -- Update recipient balance (add amount)
  EXECUTE format('UPDATE wallets SET %I = %I + %L WHERE id = %L', 
    v_balance_field, v_balance_field, p_amount, v_recipient_wallet_id);
  
  -- Create sender transaction (debit) - using 'transfer' type
  INSERT INTO transactions (
    wallet_id, type, amount, currency, status, description, reference_id
  ) VALUES (
    v_sender_wallet_id, 
    'transfer'::transaction_type, 
    -(p_amount + p_fee), 
    upper(p_currency)::currency_type, 
    'completed', 
    p_description || ' (envoyé)', 
    gen_random_uuid()
  );
  
  -- Create recipient transaction (credit) - using 'payment' type
  INSERT INTO transactions (
    wallet_id, type, amount, currency, status, description, reference_id
  ) VALUES (
    v_recipient_wallet_id, 
    'payment'::transaction_type, 
    p_amount, 
    upper(p_currency)::currency_type, 
    'completed', 
    p_description || ' (reçu)', 
    gen_random_uuid()
  );
  
  -- Create fee transaction for platform (if fee > 0)
  IF p_fee > 0 THEN
    INSERT INTO transactions (
      wallet_id, type, amount, currency, status, description, reference_id
    ) VALUES (
      NULL, -- Platform transaction
      'commission'::transaction_type, 
      p_fee, 
      upper(p_currency)::currency_type, 
      'completed', 
      'Frais de transfert - ' || p_reference, 
      gen_random_uuid()
    );
  END IF;
  
END;
$function$;