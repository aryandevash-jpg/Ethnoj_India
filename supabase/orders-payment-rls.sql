-- Allow authenticated customers to update their own orders
-- (needed so payment verification can mark orders as paid)
DROP POLICY IF EXISTS "Customers can update own orders" ON orders;
CREATE POLICY "Customers can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);
