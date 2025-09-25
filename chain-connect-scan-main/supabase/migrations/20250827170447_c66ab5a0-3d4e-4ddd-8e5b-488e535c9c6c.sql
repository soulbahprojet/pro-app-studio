-- Tables pour la gestion de stock avancée

-- Table des entrepôts/dépôts
CREATE TABLE public.warehouses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'main', -- main, secondary, external
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  zones JSONB DEFAULT '[]'::jsonb, -- [{name: "Zone A", capacity: 100, current: 50}]
  storage_capacity_m3 NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des stocks par entrepôt
CREATE TABLE public.warehouse_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  zone_location TEXT, -- Zone/Rayonnage
  quantity_available INTEGER NOT NULL DEFAULT 0,
  quantity_reserved INTEGER NOT NULL DEFAULT 0,
  quantity_damaged INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER NOT NULL DEFAULT 10,
  max_stock INTEGER NOT NULL DEFAULT 1000,
  safety_stock INTEGER NOT NULL DEFAULT 5,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(warehouse_id, product_id, zone_location)
);

-- Table des transferts entre entrepôts
CREATE TABLE public.stock_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_number TEXT NOT NULL DEFAULT ('TR-' || LPAD((EXTRACT(epoch FROM now())::INTEGER % 1000000)::TEXT, 6, '0')),
  from_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  to_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_transit, completed, cancelled
  initiated_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT,
  notes TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des fournisseurs
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  tax_id TEXT,
  payment_terms TEXT DEFAULT 'Net 30',
  lead_time_days INTEGER DEFAULT 7,
  rating NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des commandes fournisseurs
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number TEXT NOT NULL DEFAULT ('PO-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD((EXTRACT(epoch FROM now())::INTEGER % 10000)::TEXT, 4, '0')),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, confirmed, partial, delivered, cancelled
  total_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GNF',
  order_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expected_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  terms TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des lignes de commande fournisseur
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER NOT NULL DEFAULT 0,
  unit_cost NUMERIC NOT NULL,
  total_cost NUMERIC GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED,
  quality_status TEXT DEFAULT 'pending', -- pending, passed, failed, partial
  notes TEXT
);

-- Table des lots et numéros de série
CREATE TABLE public.product_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  batch_number TEXT NOT NULL,
  serial_numbers TEXT[], -- Pour les produits avec numéros de série
  manufacturing_date DATE,
  expiry_date DATE,
  quantity INTEGER NOT NULL DEFAULT 0,
  cost_per_unit NUMERIC,
  supplier_id UUID REFERENCES public.suppliers(id),
  quality_status TEXT DEFAULT 'approved', -- approved, rejected, quarantine
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(batch_number, product_id)
);

-- Table des contrôles qualité
CREATE TABLE public.quality_inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_number TEXT NOT NULL DEFAULT ('QI-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD((EXTRACT(epoch FROM now())::INTEGER % 10000)::TEXT, 4, '0')),
  product_id UUID NOT NULL REFERENCES public.products(id),
  batch_id UUID REFERENCES public.product_batches(id),
  po_item_id UUID REFERENCES public.purchase_order_items(id),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  inspector_id UUID NOT NULL REFERENCES auth.users(id),
  inspection_type TEXT NOT NULL, -- incoming, routine, return
  quantity_inspected INTEGER NOT NULL,
  quantity_passed INTEGER NOT NULL DEFAULT 0,
  quantity_failed INTEGER NOT NULL DEFAULT 0,
  defects_found JSONB DEFAULT '[]'::jsonb, -- [{type: "damage", description: "Scratched", count: 2}]
  status TEXT NOT NULL DEFAULT 'pending', -- pending, passed, failed, partial
  notes TEXT,
  photos TEXT[], -- URLs des photos
  inspected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des règles d'automatisation
CREATE TABLE public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL, -- reorder, transfer, pricing, quality
  name TEXT NOT NULL,
  conditions JSONB NOT NULL, -- {stock_level: {operator: "<=", value: 10}}
  actions JSONB NOT NULL, -- {create_po: {supplier_id: "xxx", quantity: 100}}
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  last_executed TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des permissions utilisateur
CREATE TABLE public.inventory_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- admin, manager, employee, viewer
  warehouses UUID[], -- IDs des entrepôts accessibles
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb, -- {view_stock: true, edit_stock: true, transfer: false}
  is_active BOOLEAN DEFAULT true,
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Sellers manage their warehouses" ON public.warehouses
FOR ALL USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers manage warehouse inventory" ON public.warehouse_inventory
FOR ALL USING (warehouse_id IN (SELECT id FROM public.warehouses WHERE seller_id = auth.uid()))
WITH CHECK (warehouse_id IN (SELECT id FROM public.warehouses WHERE seller_id = auth.uid()));

CREATE POLICY "Sellers manage stock transfers" ON public.stock_transfers
FOR ALL USING (
  from_warehouse_id IN (SELECT id FROM public.warehouses WHERE seller_id = auth.uid()) OR
  to_warehouse_id IN (SELECT id FROM public.warehouses WHERE seller_id = auth.uid())
);

CREATE POLICY "Sellers manage their suppliers" ON public.suppliers
FOR ALL USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers manage their purchase orders" ON public.purchase_orders
FOR ALL USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers manage purchase order items" ON public.purchase_order_items
FOR ALL USING (po_id IN (SELECT id FROM public.purchase_orders WHERE seller_id = auth.uid()));

CREATE POLICY "Sellers manage product batches" ON public.product_batches
FOR ALL USING (warehouse_id IN (SELECT id FROM public.warehouses WHERE seller_id = auth.uid()));

CREATE POLICY "Sellers manage quality inspections" ON public.quality_inspections
FOR ALL USING (warehouse_id IN (SELECT id FROM public.warehouses WHERE seller_id = auth.uid()));

CREATE POLICY "Sellers manage automation rules" ON public.automation_rules
FOR ALL USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers manage inventory permissions" ON public.inventory_permissions
FOR ALL USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_transfers_updated_at BEFORE UPDATE ON public.stock_transfers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();