'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Plus, Trash2, MapPin } from 'lucide-react'
import { submitRoute, updateRoute } from '@/app/actions'
import { useAuth } from '@/lib/auth'
import { Route } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import LocationSearch from './LocationSearch'
import clsx from 'clsx'

interface AddRouteFormProps {
    onClose?: () => void
    onSuccess: () => void
    initialData?: Route | null
    isEmbedded?: boolean
    onPickLocation?: (field: 'start' | 'end' | 'stop', index?: number) => void
    pickedLocation?: { field: 'start' | 'end' | 'stop', lat: number, lng: number, name: string } | null
}

export default function AddRouteForm({ onClose, onSuccess, initialData, isEmbedded = false, onPickLocation, pickedLocation }: AddRouteFormProps) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    // Stops now store name and coords
    const [stops, setStops] = useState<{ name: string, lat: number, lng: number }[]>([])

    const [formData, setFormData] = useState({
        start_name: '',
        end_name: '',
        price: '',
        vehicle_type: 'taxi',
        start_lat: 9.0192,
        start_lng: 38.7525,
        end_lat: 9.0192,
        end_lng: 38.7525
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                start_name: initialData.start_name,
                end_name: initialData.end_name,
                price: initialData.price.toString(),
                vehicle_type: initialData.vehicle_type,
                start_lat: initialData.start_lat,
                start_lng: initialData.start_lng,
                end_lat: initialData.end_lat,
                end_lng: initialData.end_lng
            })
            fetchStops(initialData.id)
        } else {
            // Reset form
            setFormData({
                start_name: '',
                end_name: '',
                price: '',
                vehicle_type: 'taxi',
                start_lat: 9.0192,
                start_lng: 38.7525,
                end_lat: 9.0192,
                end_lng: 38.7525
            })
            setStops([])
        }
    }, [initialData])

    useEffect(() => {
        if (pickedLocation) {
            if (pickedLocation.field === 'start') {
                setFormData(prev => ({ ...prev, start_name: pickedLocation.name, start_lat: pickedLocation.lat, start_lng: pickedLocation.lng }))
            } else if (pickedLocation.field === 'end') {
                setFormData(prev => ({ ...prev, end_name: pickedLocation.name, end_lat: pickedLocation.lat, end_lng: pickedLocation.lng }))
            } else if (pickedLocation.field === 'stop') {
                // We need to know which stop index. 
                // For now, let's assume we handle stop picking differently or pass index in pickedLocation if needed.
                // But the current implementation of pickedLocation doesn't have index.
                // Let's skip stop picking from map for now or handle it later if requested.
            }
        }
    }, [pickedLocation])

    const fetchStops = async (routeId: number) => {
        const { data, error } = await supabase
            .from('stops')
            .select('name, lat, lng')
            .eq('route_id', routeId)
            .order('stop_order', { ascending: true })

        if (data && data.length > 0) {
            setStops(data.map(s => ({ name: s.name || '', lat: s.lat, lng: s.lng })))
        } else {
            setStops([])
        }
    }

    const handleAddStop = () => {
        setStops([...stops, { name: '', lat: 0, lng: 0 }])
    }

    const handleRemoveStop = (index: number) => {
        const newStops = stops.filter((_, i) => i !== index)
        setStops(newStops)
    }

    const handleStopSelect = (index: number, location: { name: string, lat: number, lng: number }) => {
        const newStops = [...stops]
        newStops[index] = location
        setStops(newStops)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setLoading(true)
        try {
            const validStops = stops.filter(stop => stop.name.trim() !== '')

            let result
            if (initialData) {
                result = await updateRoute(initialData.id, formData, validStops, user.id)
            } else {
                result = await submitRoute(formData, validStops, user.id)
            }

            if (!result.success) {
                throw new Error(result.message)
            }

            alert(result.message)
            onSuccess()
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message)
            } else {
                alert('An unexpected error occurred')
            }
        } finally {
            setLoading(false)
        }
    }

    const content = (
        <div className={clsx("flex flex-col h-full", isEmbedded ? "" : "bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh]")}>
            {!isEmbedded && (
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {initialData ? 'Edit Route' : 'Add New Route'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <X size={24} />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Start Location</label>
                    <LocationSearch
                        placeholder="Search start location..."
                        defaultValue={formData.start_name}
                        onSelect={(loc) => setFormData({
                            ...formData,
                            start_name: loc.name,
                            start_lat: loc.lat,
                            start_lng: loc.lng
                        })}
                        onPickFromMap={() => onPickLocation?.('start')}
                    />
                </div>

                {/* Intermediate Stops */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Intermediate Stops (Optional)</label>
                    {stops.map((stop, index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <div className="flex-1">
                                <LocationSearch
                                    placeholder={`Search stop ${index + 1}...`}
                                    defaultValue={stop.name}
                                    onSelect={(loc) => handleStopSelect(index, loc)}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveStop(index)}
                                className="text-red-500 hover:text-red-700 p-2 mt-1"
                                title="Remove stop"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleAddStop}
                        className="text-sm text-primary hover:text-primary-hover font-medium self-start flex items-center gap-1"
                    >
                        <Plus size={16} /> Add Stop
                    </button>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">End Location</label>
                    <LocationSearch
                        placeholder="Search destination..."
                        defaultValue={formData.end_name}
                        onSelect={(loc) => setFormData({
                            ...formData,
                            end_name: loc.name,
                            end_lat: loc.lat,
                            end_lng: loc.lng
                        })}
                        onPickFromMap={() => onPickLocation?.('end')}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Price (ETB)</label>
                    <input
                        type="number"
                        placeholder="e.g. 15"
                        required
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Vehicle Type</label>
                    <select
                        value={formData.vehicle_type}
                        onChange={e => setFormData({ ...formData, vehicle_type: e.target.value })}
                        className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    >
                        <option value="taxi">Taxi (Minibus)</option>
                        <option value="bus">Bus (Anbessa)</option>
                        <option value="ride">Ride/Uber</option>
                        <option value="bajaj">Bajaj</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-hover text-white p-3 rounded-lg font-semibold mt-4 disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" /> : null}
                    {loading ? (initialData ? 'Updating...' : 'Submitting...') : (initialData ? 'Update Route' : 'Submit Route')}
                </button>
            </form>
        </div>
    )

    if (isEmbedded) {
        return content
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200] p-4">
            {content}
        </div>
    )
}
