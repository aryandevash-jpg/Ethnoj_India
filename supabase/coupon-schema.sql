-- Coupon System Schema for Ethnoj
-- Run this in Supabase SQL Editor

-- ============================================================
-- OPTION 1: If you have an existing 'coupons' table with different
-- structure, run these DROP statements first (uncomment both lines):
-- ============================================================
DROP TABLE IF EXISTS coupon_usage CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
-- ============================================================

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  
  -- Discount Type: 'flat', 'percentage', 'free_shipping'
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('flat', 'percentage', 'free_shipping')),
  
  -- Discount Value (amount for flat, percentage for percentage, ignored for free_shipping)
  discount_value DECIMAL(10, 2) DEFAULT 0,
  
  -- Maximum discount for percentage coupons (cap)
  max_discount DECIMAL(10, 2),
  
  -- Minimum order value required to use coupon
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  
  -- Usage limits
  usage_limit INTEGER, -- Total times coupon can be used (null = unlimited)
  usage_limit_per_user INTEGER DEFAULT 1, -- Times each user can use (null = unlimited)
  times_used INTEGER DEFAULT 0, -- Track total usage
  
  -- Validity period
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20);
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_discount DECIMAL(10, 2);
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS min_order_value DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS usage_limit INTEGER;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS usage_limit_per_user INTEGER DEFAULT 1;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS times_used INTEGER DEFAULT 0;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Coupon Usage Tracking Table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_email VARCHAR(255), -- For guest checkouts
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_email ON coupon_usage(user_email);

-- Create expires_at index only if column exists (safe creation)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coupons' AND column_name = 'expires_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons(expires_at);
  END IF;
END $$;

-- Row Level Security
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Public can read active coupons (for validation)
CREATE POLICY "Public can read active coupons" ON coupons
  FOR SELECT USING (is_active = true);

-- Users can see their own coupon usage
CREATE POLICY "Users can view own coupon usage" ON coupon_usage
  FOR SELECT USING (
    auth.uid() = user_id OR 
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow inserts for coupon usage (when applying coupons)
CREATE POLICY "Anyone can record coupon usage" ON coupon_usage
  FOR INSERT WITH CHECK (true);

-- Trigger to update updated_at on coupons
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION validate_coupon(
  p_code VARCHAR,
  p_order_total DECIMAL,
  p_user_id UUID DEFAULT NULL,
  p_user_email VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  valid BOOLEAN,
  coupon_id UUID,
  discount_type VARCHAR,
  discount_value DECIMAL,
  max_discount DECIMAL,
  calculated_discount DECIMAL,
  message VARCHAR
) AS $$
DECLARE
  v_coupon RECORD;
  v_user_usage_count INTEGER;
  v_calculated_discount DECIMAL;
BEGIN
  -- Find the coupon
  SELECT * INTO v_coupon
  FROM coupons
  WHERE UPPER(code) = UPPER(p_code)
    AND is_active = true;
  
  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false, NULL::UUID, NULL::VARCHAR, NULL::DECIMAL, NULL::DECIMAL, NULL::DECIMAL,
      'Invalid coupon code'::VARCHAR;
    RETURN;
  END IF;
  
  -- Check if coupon has started
  IF v_coupon.starts_at > NOW() THEN
    RETURN QUERY SELECT 
      false, NULL::UUID, NULL::VARCHAR, NULL::DECIMAL, NULL::DECIMAL, NULL::DECIMAL,
      'This coupon is not yet active'::VARCHAR;
    RETURN;
  END IF;
  
  -- Check if coupon has expired
  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < NOW() THEN
    RETURN QUERY SELECT 
      false, NULL::UUID, NULL::VARCHAR, NULL::DECIMAL, NULL::DECIMAL, NULL::DECIMAL,
      'This coupon has expired'::VARCHAR;
    RETURN;
  END IF;
  
  -- Check minimum order value
  IF p_order_total < v_coupon.min_order_value THEN
    RETURN QUERY SELECT 
      false, NULL::UUID, NULL::VARCHAR, NULL::DECIMAL, NULL::DECIMAL, NULL::DECIMAL,
      ('Minimum order value of ₹' || v_coupon.min_order_value || ' required')::VARCHAR;
    RETURN;
  END IF;
  
  -- Check total usage limit
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.times_used >= v_coupon.usage_limit THEN
    RETURN QUERY SELECT 
      false, NULL::UUID, NULL::VARCHAR, NULL::DECIMAL, NULL::DECIMAL, NULL::DECIMAL,
      'This coupon has reached its usage limit'::VARCHAR;
    RETURN;
  END IF;
  
  -- Check per-user usage limit
  IF v_coupon.usage_limit_per_user IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_usage_count
    FROM coupon_usage
    WHERE coupon_id = v_coupon.id
      AND (
        (p_user_id IS NOT NULL AND user_id = p_user_id)
        OR (p_user_email IS NOT NULL AND user_email = p_user_email)
      );
    
    IF v_user_usage_count >= v_coupon.usage_limit_per_user THEN
      RETURN QUERY SELECT 
        false, NULL::UUID, NULL::VARCHAR, NULL::DECIMAL, NULL::DECIMAL, NULL::DECIMAL,
        'You have already used this coupon'::VARCHAR;
      RETURN;
    END IF;
  END IF;
  
  -- Calculate discount based on type
  CASE v_coupon.discount_type
    WHEN 'flat' THEN
      v_calculated_discount := LEAST(v_coupon.discount_value, p_order_total);
    WHEN 'percentage' THEN
      v_calculated_discount := (p_order_total * v_coupon.discount_value / 100);
      IF v_coupon.max_discount IS NOT NULL THEN
        v_calculated_discount := LEAST(v_calculated_discount, v_coupon.max_discount);
      END IF;
    WHEN 'free_shipping' THEN
      v_calculated_discount := 0; -- Handled separately
    ELSE
      v_calculated_discount := 0;
  END CASE;
  
  -- Return valid coupon
  RETURN QUERY SELECT 
    true,
    v_coupon.id,
    v_coupon.discount_type,
    v_coupon.discount_value,
    v_coupon.max_discount,
    v_calculated_discount,
    'Coupon applied successfully'::VARCHAR;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record coupon usage and increment counter
CREATE OR REPLACE FUNCTION record_coupon_usage(
  p_coupon_id UUID,
  p_user_id UUID,
  p_user_email VARCHAR,
  p_order_id UUID,
  p_discount_amount DECIMAL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert usage record
  INSERT INTO coupon_usage (coupon_id, user_id, user_email, order_id, discount_amount)
  VALUES (p_coupon_id, p_user_id, p_user_email, p_order_id, p_discount_amount);
  
  -- Increment times_used counter
  UPDATE coupons
  SET times_used = times_used + 1
  WHERE id = p_coupon_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add coupon_code and coupon_discount to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10, 2) DEFAULT 0;

-- Sample coupons for testing
INSERT INTO coupons (code, description, discount_type, discount_value, max_discount, min_order_value, usage_limit, expires_at) VALUES
  ('WELCOME10', 'Welcome discount - 10% off on your first order', 'percentage', 10, 500, 999, NULL, NOW() + INTERVAL '1 year'),
  ('FLAT500', 'Flat ₹500 off on orders above ₹2999', 'flat', 500, NULL, 2999, 100, NOW() + INTERVAL '6 months'),
  ('FREESHIP', 'Free shipping on orders above ₹1499', 'free_shipping', 0, NULL, 1499, NULL, NOW() + INTERVAL '1 year')
ON CONFLICT (code) DO NOTHING;
