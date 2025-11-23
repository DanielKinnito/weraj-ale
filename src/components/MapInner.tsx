'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'
import { Route } from '@/lib/types'

// Fix for default marker icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png'
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png'
const shadowUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png'

export default function MapInner({ routes = [] }: { routes?: Route[] }) {
    useEffect(() => {
        // Client-side only fix
        if (typeof window !== 'undefined') {
            const DefaultIcon = L.icon({
                iconUrl,
                iconRetinaUrl,
                shadowUrl,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            })
            L.Marker.prototype.options.icon = DefaultIcon
        }
    }, [])

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
