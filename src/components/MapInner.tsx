'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Route } from '@/lib/types'
import { useEffect, useState } from 'react'
import RoutePolyline from './RoutePolyline'

// Fix for default marker icons in Next.js
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png'
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png'
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
})

interface MapInnerProps {
    routes: Route[]
    selectedRoute?: Route | null
}

function MapInvalidator() {
    const map = useMap()
    useEffect(() => {
        map.invalidateSize()
    }, [map])
    return null
}

function FlyToRoute({ selectedRoute }: { selectedRoute: Route | null }) {
    const map = useMap()

    useEffect(() => {
        if (selectedRoute) {
            map.flyTo([selectedRoute.start_lat, selectedRoute.start_lng], 15, {
                animate: true,
                duration: 1.5
            })
        }
    }, [selectedRoute, map])

    return null
}

export default function MapInner({ routes, selectedRoute }: MapInnerProps) {
    const position: [number, number] = [9.0192, 38.7525] // Addis Ababa

    return (
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <MapInvalidator />
            <FlyToRoute selectedRoute={selectedRoute || null} />
            {selectedRoute && <RoutePolyline route={selectedRoute} />}

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
