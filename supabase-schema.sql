-- Изпълни това в Supabase SQL Editor (supabase.com → твоя проект → SQL Editor)

-- Таблица за части
CREATE TABLE parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT NOT NULL DEFAULT 'dvigatel',
  brand TEXT DEFAULT '',
  model TEXT DEFAULT '',
  year_from INT,
  year_to INT,
  condition TEXT NOT NULL DEFAULT 'употребяван' CHECK (condition IN ('нов', 'употребяван', 'преработен')),
  images TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  part_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица за поръчки
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cash_on_delivery', 'whatsapp')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Публичен достъп до части (всеки може да чете)
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parts are viewable by everyone" ON parts FOR SELECT USING (true);

-- Само admin може да пише в parts (през service role key)
CREATE POLICY "Admin can insert parts" ON parts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update parts" ON parts FOR UPDATE USING (true);
CREATE POLICY "Admin can delete parts" ON parts FOR DELETE USING (true);

-- Поръчките — всеки може да създаде, само admin може да чете
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create order" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin reads orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Admin updates orders" ON orders FOR UPDATE USING (true);

-- Storage bucket за снимки
INSERT INTO storage.buckets (id, name, public) VALUES ('parts', 'parts', true);
CREATE POLICY "Public images" ON storage.objects FOR SELECT USING (bucket_id = 'parts');
CREATE POLICY "Admin upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'parts');
CREATE POLICY "Admin delete" ON storage.objects FOR DELETE USING (bucket_id = 'parts');

-- Примерни данни (по желание)
INSERT INTO parts (title, description, price, original_price, category, brand, model, year_from, year_to, condition, in_stock) VALUES
('Двигател BMW N47 2.0d 143кс', 'Изваден двигател в отлично състояние. Пробег 180 000 км. Тестван преди продажба.', 1200, 1500, 'dvigatel', 'BMW', 'E90', 2008, 2012, 'употребяван', true),
('Ляв LED фар Mercedes W213', 'Оригинален LED фар, без пукнатини. Внос от Германия.', 890, null, 'osvetlenie', 'Mercedes', 'W213', 2016, 2020, 'нов', true),
('Комплект спирачни дискове Brembo', 'Нови дискове Brembo за VW Golf 7. Предни + задни.', 240, null, 'hodova', 'VW', 'Golf 7', 2013, 2020, 'нов', true);
