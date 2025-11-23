export type Route = {
    id: number
    user_id: string
    start_name: string
    start_lat: number
    start_lng: number
    end_name: string
    end_lat: number
    end_lng: number
    price: number
    vehicle_type: 'taxi' | 'bus' | 'ride' | 'bajaj'
    description?: string
    is_verified: boolean
    created_at: string
    updated_at?: string
    avg_rating?: number
    rating_count?: number
}

export type Stop = {
    id: number
    route_id: number
    name?: string
    lat: number
    lng: number
    stop_order: number
}

export type Review = {
    id: number
    route_id: number
    user_id: string
    rating: number
    comment?: string
    created_at: string
}
