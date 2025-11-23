'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Initialize Supabase client for server-side usage
// Note: In a real app, use @supabase/ssr for better cookie handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function submitRoute(formData: any, userId: string) {
    if (!userId) {
        return { success: false, message: 'User not authenticated' }
    }

    // 1. Rate Limiting Check
    // Check if user has submitted a route in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data: recentRoutes, error: fetchError } = await supabase
        .from('routes')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', fiveMinutesAgo)
        .limit(1)

    if (fetchError) {
        console.error('Error checking rate limit:', fetchError)
        return { success: false, message: 'System error. Please try again.' }
    }

    if (recentRoutes && recentRoutes.length > 0) {
        return { success: false, message: 'Rate limit exceeded. Please wait 5 minutes before adding another route.' }
    }

    // 2. Submit Route
    const { error } = await supabase.from('routes').insert({
        user_id: userId,
        start_name: formData.start_name,
        start_lat: formData.start_lat,
        start_lng: formData.start_lng,
        end_name: formData.end_name,
        end_lat: formData.end_lat,
        end_lng: formData.end_lng,
        price: parseFloat(formData.price),
        vehicle_type: formData.vehicle_type,
        is_verified: false
    })

    if (error) {
        console.error('Error submitting route:', error)
        return { success: false, message: 'Failed to save route.' }
    }

    return { success: true, message: 'Route submitted successfully!' }
}
