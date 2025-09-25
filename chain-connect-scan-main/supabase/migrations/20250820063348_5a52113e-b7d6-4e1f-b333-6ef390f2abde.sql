-- Créer la fonction pour traiter les transferts entre wallets
CREATE OR REPLACE FUNCTION public.process_wallet_transfer(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_amount NUMERIC,
  p_currency TEXT,
  p_fee NUMERIC,
  p_reference TEXT,
  p_purpose TEXT DEFAULT 'transfer',
  p_description TEXT DEFAULT 'Transfert entre utilisateurs'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  
  -- Create sender transaction (debit)
  INSERT INTO transactions (
    wallet_id, type, amount, currency, status, description, reference_id
  ) VALUES (
    v_sender_wallet_id, 
    'transfer_out', 
    -(p_amount + p_fee), 
    upper(p_currency)::currency_type, 
    'completed', 
    p_description || ' (envoyé)', 
    p_reference
  );
  
  -- Create recipient transaction (credit)
  INSERT INTO transactions (
    wallet_id, type, amount, currency, status, description, reference_id
  ) VALUES (
    v_recipient_wallet_id, 
    'transfer_in', 
    p_amount, 
    upper(p_currency)::currency_type, 
    'completed', 
    p_description || ' (reçu)', 
    p_reference
  );
  
  -- Create fee transaction for platform (if fee > 0)
  IF p_fee > 0 THEN
    INSERT INTO transactions (
      wallet_id, type, amount, currency, status, description, reference_id
    ) VALUES (
      NULL, -- Platform transaction
      'fee', 
      p_fee, 
      upper(p_currency)::currency_type, 
      'completed', 
      'Frais de transfert - ' || p_reference, 
      p_reference || '_FEE'
    );
  END IF;
  
END;
$$;