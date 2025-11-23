'use server'

import { createClient } from '@/utils/supabase/server'

// Configuration: Rate Limit in Minutes
const RATE_LIMIT_MINUTES = 1

export async function submitRoute(formData: any, stops: { name: string, lat: number, lng: number }[], userId: string) {
    const supabase = await createClient()

    // 1. Rate Limiting Check
    const timeLimit = new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000).toISOString()

    const { data: recentRoutes, error: fetchError } = await supabase
        .from('routes')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', timeLimit)
        .limit(1)

    if (fetchError) {
        console.error('Error checking rate limit:', fetchError)
        return { success: false, message: 'Failed to check rate limit' }
    }

    if (recentRoutes && recentRoutes.length > 0) {
        return { success: false, message: `Rate limit exceeded. Please wait ${RATE_LIMIT_MINUTES} minute(s) before adding another route.` }
    }

    // 2. Insert Route
    const { data: route, error: routeError } = await supabase
        .from('routes')
        .insert({
            user_id: userId,
            start_name: formData.start_name,
            end_name: formData.end_name,
            start_lat: formData.start_lat,
            start_lng: formData.start_lng,
            end_lat: formData.end_lat,
            end_lng: formData.end_lng,
            price: parseFloat(formData.price),
            vehicle_type: formData.vehicle_type
        })
        .select()
        .single()

    if (routeError) {
        console.error('Error inserting route:', routeError)
        return { success: false, message: `Failed to add route: ${routeError.message}` }
    }

    // 3. Insert Stops
    if (stops && stops.length > 0) {
        const stopsData = stops.map((stop, index) => ({
            route_id: route.id,
            name: stop.name,
            lat: stop.lat,
            lng: stop.lng,
            stop_order: index + 1
        }))

        const { error: stopsError } = await supabase
            .from('stops')
            .insert(stopsData)

        if (stopsError) {
            console.error('Error inserting stops:', stopsError)
            return { success: true, message: 'Route added, but some stops failed to save.' }
        }
    }

    return { success: true, message: 'Route submitted successfully!' }
}

export async function updateRoute(routeId: number, formData: any, stops: { name: string, lat: number, lng: number }[], userId: string) {
    const supabase = await createClient()

    // 1. Verify Ownership
    const { data: existingRoute, error: fetchError } = await supabase
        .from('routes')
        .select('user_id')
        .eq('id', routeId)
        .single()

    if (fetchError || !existingRoute) {
        return { success: false, message: 'Route not found' }
    }

    if (existingRoute.user_id !== userId) {
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
            price: parseFloat(formData.price),
            vehicle_type: formData.vehicle_type,
            updated_at: new Date().toISOString()
        })
        .eq('id', routeId)

    if (updateError) {
        console.error('Error updating route:', updateError)
        return { success: false, message: `Failed to update route: ${updateError.message}` }
    }

    // 3. Update Stops (Delete all and re-insert)
    // First delete existing stops
    const { error: deleteStopsError } = await supabase
        .from('stops')
        .delete()
        .eq('route_id', routeId)

    if (deleteStopsError) {
        console.error('Error deleting old stops:', deleteStopsError)
        return { success: false, message: 'Failed to update stops' }
    }

    // Insert new stops
    if (stops && stops.length > 0) {
        const stopsData = stops.map((stop, index) => ({
            route_id: routeId,
            name: stop.name,
            lat: stop.lat,
            lng: stop.lng,
            stop_order: index + 1
        }))

        const { error: stopsError } = await supabase
            .from('stops')
            .insert(stopsData)

        if (stopsError) {
            console.error('Error inserting new stops:', stopsError)
            return { success: true, message: 'Route updated, but stops failed to save.' }
        }
    }

    return { success: true, message: 'Route updated successfully!' }
}

export async function deleteRoute(routeId: number, userId: string) {
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
        return { success: false, message: 'You are not authorized to delete this route' }
    }

    // 2. Delete Route (Cascade will handle stops)
    // We use .select() to ensure we get back the deleted row. 
    // If no row is returned, it means nothing was deleted (maybe RLS or ID mismatch).
    const { data: deletedRoute, error: deleteError } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId)
        .select()
        .single()

    if (deleteError) {
        console.error('Error deleting route:', deleteError)
        return { success: false, message: `Failed to delete route: ${deleteError.message} (Code: ${deleteError.code})` }
    }

    if (!deletedRoute) {
        console.error('Delete operation returned no data')
        return { success: false, message: 'Failed to delete route. It may have already been deleted or you do not have permission.' }
    }

    return { success: true, message: 'Route deleted successfully!' }
}

export async function searchLocation(query: string) {
    const apiKey = process.env.ORS_API_KEY
    if (!apiKey) {
        console.error('ORS_API_KEY is missing')
        return { success: false, message: 'Server configuration error' }
    }

    try {
        const response = await fetch(
            `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(query)}&boundary.country=ET&size=5`
        )

        if (!response.ok) {
            throw new Error(`ORS API Error: ${response.statusText}`)
        }

        const data = await response.json()
        return { success: true, data: data.features || [] }
    } catch (error: any) {
        console.error('Error searching location:', error)
        return { success: false, message: 'Failed to search location' }
    }
}

export async function reverseGeocode(lat: number, lng: number) {
    const apiKey = process.env.ORS_API_KEY
    if (!apiKey) {
        return { success: false, message: 'Server configuration error' }
    }

    try {
        const response = await fetch(
            `https://api.openrouteservice.org/geocode/reverse?api_key=${apiKey}&point.lat=${lat}&point.lon=${lng}&size=1`
        )

        if (!response.ok) {
            throw new Error(`ORS API Error: ${response.statusText}`)
        }

        const data = await response.json()
        if (data.features && data.features.length > 0) {
            return { success: true, name: data.features[0].properties.name || data.features[0].properties.label }
        }
        return { success: false, message: 'No address found' }
    } catch (error: any) {
        console.error('Error reverse geocoding:', error)
        return { success: false, message: 'Failed to resolve location' }
    }
}
