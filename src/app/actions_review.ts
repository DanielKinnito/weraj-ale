'use server'

import { createClient } from '@/utils/supabase/server'

export async function submitReview(routeId: number, rating: number, comment: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'User not authenticated' }
    }

    // Check if user has already reviewed this route
    const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('route_id', routeId)
        .eq('user_id', user.id)
        .single()

    if (existingReview) {
        return { success: false, message: 'You have already reviewed this route.' }
    }

    const { error } = await supabase.from('reviews').insert({
        route_id: routeId,
        user_id: user.id,
        rating,
        comment
    })

    if (error) {
        console.error('Error submitting review:', error)
        return { success: false, message: 'Failed to submit review.' }
    }

    return { success: true, message: 'Review submitted successfully!' }
}
