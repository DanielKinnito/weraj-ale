'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { Route } from '@/lib/types'

export default function MapInner({ routes = [] }: { routes?: Route[] }) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)

        // Fix for default marker icons in Next.js
        // We need to import 'leaflet' dynamically to avoid SSR issues
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
