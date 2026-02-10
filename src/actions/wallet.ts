'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')

export async function linkWallet(walletAddress: string) {
    const validated = addressSchema.safeParse(walletAddress)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            wallet_address: validated.data,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function unlinkWallet() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            wallet_address: null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function saveSmartAccount(smartAccountAddress: string) {
    const validated = addressSchema.safeParse(smartAccountAddress)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            smart_account_address: validated.data,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function getWalletInfo() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('wallet_address, smart_account_address')
        .eq('id', user.id)
        .single()

    if (error) {
        return { error: error.message }
    }

    return {
        walletAddress: data.wallet_address,
        smartAccountAddress: data.smart_account_address,
    }
}
