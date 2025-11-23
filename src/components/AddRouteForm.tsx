'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Plus, Trash2 } from 'lucide-react'
import { submitRoute, updateRoute } from '@/app/actions'
import { useAuth } from '@/lib/auth'
import { Route } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface AddRouteFormProps {
    onClose: () => void
    onSuccess: () => void
    initialData?: Route | null
}

export default function AddRouteForm({ onClose, onSuccess, initialData }: AddRouteFormProps) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [stops, setStops] = useState<string[]>([''])
    const [formData, setFormData] = useState({
        start_name: '',
        end_name: '',
        price: '',
        vehicle_type: 'taxi',
        start_lat: 9.0192, // Default Addis Ababa
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
        }
    }, [initialData])

    const fetchStops = async (routeId: number) => {
        const { data, error } = await supabase
            .from('stops')
            .select('name')
            .eq('route_id', routeId)
            .order('stop_order', { ascending: true })

        if (data && data.length > 0) {
            setStops(data.map(s => s.name))
        } else {
            setStops([''])
        }
    }

    const handleAddStop = () => {
        setStops([...stops, ''])
    }

    const handleRemoveStop = (index: number) => {
        const newStops = stops.filter((_, i) => i !== index)
        setStops(newStops)
    }

    const handleStopChange = (index: number, value: string) => {
        const newStops = [...stops]
        newStops[index] = value
        setStops(newStops)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setLoading(true)
        try {
            const validStops = stops.filter(stop => stop.trim() !== '')

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
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {initialData ? 'Edit Route' : 'Add New Route'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Start Location</label>
                        <input
                            type="text"
                            placeholder="e.g. Bole"
                            required
                            value={formData.start_name}
                            onChange={e => setFormData({ ...formData, start_name: e.target.value })}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    {/* Intermediate Stops */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Intermediate Stops (Optional)</label>
                        {stops.map((stop, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={`Stop ${index + 1}`}
                                    value={stop}
                                    onChange={e => handleStopChange(index, e.target.value)}
                                    className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                {stops.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveStop(index)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                        title="Remove stop"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddStop}
                            className="text-sm text-primary hover:text-primary-hover font-medium self-start"
                        >
                            + Add Stop
                        </button>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">End Location</label>
                        <input
                            type="text"
                            placeholder="e.g. Piassa"
                            required
                            value={formData.end_name}
                            onChange={e => setFormData({ ...formData, end_name: e.target.value })}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Vehicle Type</label>
                        <select
                            value={formData.vehicle_type}
                            onChange={e => setFormData({ ...formData, vehicle_type: e.target.value })}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                            <option value="taxi">Taxi (Minibus)</option>
                            <option value="bus">Bus (Anbessa)</option>
                            <option value="ride">Ride/Uber</option>
                            <option value="bajaj">Bajaj</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="bg-primary hover:bg-primary-hover text-white p-3 rounded-md font-semibold mt-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        disabled={loading}
                    >
                        {loading ? (initialData ? 'Updating...' : 'Submitting...') : (initialData ? 'Update Route' : 'Submit Route')}
                    </button>
                </form>
            </div>
        </div>
    )
}
