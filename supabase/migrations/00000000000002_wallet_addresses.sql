-- Migration: Add wallet addresses to profiles (hybrid mode)
-- This migration adds wallet and smart account address fields for Web3 integration.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wallet_address TEXT,
  ADD COLUMN IF NOT EXISTS smart_account_address TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON public.profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_profiles_smart_account ON public.profiles(smart_account_address);
