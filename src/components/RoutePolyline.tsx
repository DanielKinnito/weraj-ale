'use client'

import { useEffect, useState } from 'react'
import { Polyline, useMap } from 'react-leaflet'
import { Route } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface RoutePolylineProps {
    route: Route
}

export default function RoutePolyline({ route }: RoutePolylineProps) {
    const [positions, setPositions] = useState<[number, number][]>([])
    const map = useMap()

    useEffect(() => {
        if (!route) return

        const fetchRoute = async () => {
            // 1. Get stops
            const { data: stops } = await supabase
                .from('stops')
                .select('lat, lng')
                .eq('route_id', route.id)
                .order('stop_order', { ascending: true })

            // 2. Construct coordinates string for OSRM
            // Format: lng,lat;lng,lat...
            let coords = `${route.start_lng},${route.start_lat}`

            if (stops && stops.length > 0) {
                stops.forEach(stop => {
                    // Only include valid stops (though we should have filtered them)
                    if (stop.lat && stop.lng) {
                        coords += `;${stop.lng},${stop.lat}`
                    }
                })
            }

            coords += `;${route.end_lng},${route.end_lat}`

            try {
                // Using OSRM public demo server (Note: strictly for demo/low volume)
                // For production, use a self-hosted OSRM or a paid service like Mapbox/Google
                const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`)
                const data = await response.json()

                if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                    const coordinates = data.routes[0].geometry.coordinates
                    // GeoJSON is [lng, lat], Leaflet needs [lat, lng]
                    const latLngs = coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number])
                    setPositions(latLngs)
                } else {
                    // Fallback to straight line if OSRM fails
                    setPositions([
                        [route.start_lat, route.start_lng],
                        [route.end_lat, route.end_lng]
                    ])
                }
            } catch (error) {
                console.error('Error fetching OSRM route:', error)
                // Fallback
                setPositions([
                    [route.start_lat, route.start_lng],
                    [route.end_lat, route.end_lng]
                ])
            }
        }

        fetchRoute()
    }, [route])

    if (positions.length === 0) return null

    return (
        <Polyline
            positions={positions}
            color="#2563eb"
            weight={5}
            opacity={0.7}
        />
    )
}
