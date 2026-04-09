-- Add recipient and comments fields to orders table (nullable for existing data)
ALTER TABLE public.orders
ADD COLUMN recipient_name text,
ADD COLUMN recipient_age integer,
ADD COLUMN recipient_date date,
ADD COLUMN comments text;
