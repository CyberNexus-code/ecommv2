-- Create tags table
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create items_tags junction table for many-to-many relationship
CREATE TABLE items_tags (
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (item_id, tag_id)
);

-- Add indexes for faster queries
CREATE INDEX idx_items_tags_item_id ON items_tags(item_id);
CREATE INDEX idx_items_tags_tag_id ON items_tags(tag_id);
CREATE INDEX idx_tags_slug ON tags(slug);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for tags (allow public read, admin write)
CREATE POLICY "Tags are viewable by everyone" ON tags FOR SELECT USING (true);
CREATE POLICY "Only admins can insert tags" ON tags FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
CREATE POLICY "Only admins can update tags" ON tags FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
CREATE POLICY "Only admins can delete tags" ON tags FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- RLS policies for items_tags (allow public read, admin write)
CREATE POLICY "Items_tags are viewable by everyone" ON items_tags FOR SELECT USING (true);
CREATE POLICY "Only admins can manage items_tags" ON items_tags FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
CREATE POLICY "Only admins can delete items_tags" ON items_tags FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
