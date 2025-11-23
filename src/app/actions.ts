'use server'

import { createClient } from '@/utils/supabase/server'

// Configuration: Rate Limit in Minutes
const RATE_LIMIT_MINUTES = 1

export async function submitRoute(formData: any, stops: string[], userId: string) {
    const supabase = await createClient()
    if (!userId) {
        return { success: false, message: 'User not authenticated' }
    }

    // 1. Rate Limiting Check
    // Check if user has submitted a route in the last X minutes
    const timeLimit = new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000).toISOString()

    const { data: recentRoutes, error: fetchError } = await supabase
        .from('routes')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', timeLimit)
        .limit(1)

    if (fetchError) {
        console.error('Error checking rate limit:', fetchError)
        return { success: false, message: 'System error. Please try again.' }
    }

    if (recentRoutes && recentRoutes.length > 0) {
        return { success: false, message: `Rate limit exceeded. Please wait ${RATE_LIMIT_MINUTES} minutes before adding another route.` }
    }

    // 2. Submit Route
    const { data: routeData, error } = await supabase.from('routes').insert({
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
        .select()
        .single()

    if (error) {
        console.error('Error submitting route:', error)
        return { success: false, message: `Failed to save route: ${error.message}` }
    }

    // 3. Submit Stops (if any)
    if (stops && stops.length > 0) {
        const stopsData = stops.map((stopName, index) => ({
            route_id: routeData.id,
            name: stopName,
            lat: 0, // Default since we don't have geocoding yet
            lng: 0, // Default since we don't have geocoding yet
            stop_order: index + 1
        }))

        const { error: stopsError } = await supabase
            .from('stops')
            .insert(stopsData)

        if (stopsError) {
            console.error('Error submitting stops:', stopsError)
            // We don't fail the whole request if stops fail, but we log it.
            // Ideally we'd rollback, but Supabase HTTP API doesn't support transactions easily here.
        }
    }

    return { success: true, message: 'Route submitted successfully!' }
}

export async function updateRoute(routeId: number, formData: any, stops: string[], userId: string) {
    const supabase = await createClient()
    if (!userId) {
        return { success: false, message: 'User not authenticated' }
    }

    // 1. Verify Ownership
    const { data: route, error: fetchError } = await supabase
        .from('routes')
        .select('user_id')
        .eq('id', routeId)
        .single()

    if (fetchError || !route) {
        return { success: false, message: 'Route not found' }
    }

    if (route.user_id !== userId) {
        return { success: false, message: 'You are not authorized to edit this route' }
    }

    // 2. Update Route
    const { error: updateError } = await supabase
        .from('routes')
        .update({
            start_name: formData.start_name,
            end_name: formData.end_name,
            start_lat: formData.start_lat,
            start_lng: formData.start_lng,
            end_lat: formData.end_lat,
            end_lng: formData.end_lng,
            price: formData.price,
            vehicle_type: formData.vehicle_type,
            updated_at: new Date().toISOString()
        })
        .eq('id', routeId)

    if (updateError) {
        console.error('Error updating route:', updateError)
        return { success: false, message: `Failed to update route: ${updateError.message}` }
    }

    // 3. Update Stops (Delete existing and re-insert)
    // First, delete existing stops
    const { error: deleteStopsError } = await supabase
        .from('stops')
        .delete()
        .eq('route_id', routeId)

    if (deleteStopsError) {
        console.error('Error deleting old stops:', deleteStopsError)
        // Continue anyway to try inserting new ones
    }

    // Insert new stops
    if (stops && stops.length > 0) {
        const stopsData = stops.map((stopName, index) => ({
            route_id: routeId,
            name: stopName,
            lat: 0,
            lng: 0,
            stop_order: index + 1
        }))

        const { error: stopsError } = await supabase
            .from('stops')
            .insert(stopsData)

        if (stopsError) {
            console.error('Error updating stops:', stopsError)
            return { success: false, message: `Route updated, but failed to save stops: ${stopsError.message}` }
        }
    }

    return { success: true, message: 'Route updated successfully!' }
}
