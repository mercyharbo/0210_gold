-- Migration 18: Add note and is_gold_karat_priced to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS note TEXT,
ADD COLUMN IF NOT EXISTS is_gold_karat_priced BOOLEAN NOT NULL DEFAULT false;
