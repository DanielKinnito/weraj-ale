'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Route } from '@/lib/types'
import RoutePolyline from './RoutePolyline'

// Fix Leaflet default icon issue
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface MapInnerProps {
    routes: Route[]
    selectedRoute?: Route | null
    onMapClick?: (lat: number, lng: number) => void
    pickingMode?: boolean
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

function MapEvents({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick?.(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

export default function MapInner({ routes, selectedRoute, onMapClick, pickingMode = false }: MapInnerProps) {
    const position: [number, number] = [9.0192, 38.7525] // Addis Ababa

    return (
        <MapContainer
            center={position}
            zoom={13}
            style={{ height: '100%', width: '100%', cursor: pickingMode ? 'crosshair' : 'grab' }}
        >
            <MapInvalidator />
            <MapEvents onMapClick={onMapClick} />
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
