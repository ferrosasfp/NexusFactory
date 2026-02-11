export interface Profile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    wallet_address: string | null
    smart_account_address: string | null
    created_at: string
    updated_at: string
}

// Note: created_at and updated_at are `not null default now()` in the migration,
// so they are always present in SELECT results (typed as string, not null).

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile
                Insert: Omit<Profile, 'created_at' | 'updated_at'>
                Update: Partial<Omit<Profile, 'id' | 'created_at'>>
            }
        }
    }
}
