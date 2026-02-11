-- Add UNIQUE constraint to wallet_address (where not null)
CREATE UNIQUE INDEX profiles_wallet_address_key
ON public.profiles (wallet_address)
WHERE wallet_address IS NOT NULL;

-- Add UNIQUE constraint to smart_account_address (where not null)
CREATE UNIQUE INDEX profiles_smart_account_address_key
ON public.profiles (smart_account_address)
WHERE smart_account_address IS NOT NULL;

-- Add CHECK constraint for EVM address format on wallet_address
ALTER TABLE public.profiles
ADD CONSTRAINT wallet_address_format_check
CHECK (
  wallet_address IS NULL OR
  wallet_address ~ '^0x[a-fA-F0-9]{40}$'
);

-- Add CHECK constraint for EVM address format on smart_account_address
ALTER TABLE public.profiles
ADD CONSTRAINT smart_account_address_format_check
CHECK (
  smart_account_address IS NULL OR
  smart_account_address ~ '^0x[a-fA-F0-9]{40}$'
);
