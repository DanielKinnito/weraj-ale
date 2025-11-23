'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { Route } from '@/lib/types'

// Component to handle flying to a selected route
function FlyToRoute({ selectedRoute }: { selectedRoute: Route | null }) {
    const map = useMap()

    useEffect(() => {
        if (selectedRoute) {
            map.flyTo([selectedRoute.start_lat, selectedRoute.start_lng], 15, {
                duration: 1.5
            })
        }
    }, [selectedRoute, map])

    return null
}

// Component to invalidate map size on mount/resize to fix tile rendering
function MapInvalidator() {
    const map = useMap()
    useEffect(() => {
        map.invalidateSize()
    }, [map])
    return null
}

export default function MapInner({ routes = [], selectedRoute }: { routes?: Route[], selectedRoute?: Route | null }) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)

        // Fix for default marker icons in Next.js
        import('leaflet').then((L) => {
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl
            L.Icon.Default.mergeOptions({
                iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
            })
        })
    }, [])

    if (!isMounted) {
        return <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900">Loading map...</div>
    }

    // Addis Ababa coordinates
    const position: [number, number] = [9.0192, 38.7525]

    return (
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <MapInvalidator />
            <FlyToRoute selectedRoute={selectedRoute || null} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {routes.map((route) => (
                <Marker key={route.id} position={[route.start_lat, route.start_lng]}>
                    <Popup>
                        <div className="font-bold">{route.start_name}</div>
                        <div className="text-sm">Start of route to {route.end_name}</div>
                        <div className="text-xs text-slate-500">{route.vehicle_type} - {route.price} ETB</div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}
