'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface AddRouteFormProps {
    onClose: () => void
}

export default function AddRouteForm({ onClose }: AddRouteFormProps) {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // TODO: Implement submission logic
        setTimeout(() => {
            setLoading(false)
            onClose()
        }, 1000)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] backdrop-blur-[4px]">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl w-[90%] max-w-[500px] shadow-xl animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Add New Route</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Start Location</label>
                        <input
                            type="text"
                            placeholder="e.g. Bole"
                            required
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">End Location</label>
                        <input
                            type="text"
                            placeholder="e.g. Piassa"
                            required
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Price (ETB)</label>
                        <input
                            type="number"
                            placeholder="e.g. 15"
                            required
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Vehicle Type</label>
                        <select className="p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
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
                        {loading ? 'Submitting...' : 'Submit Route'}
                    </button>
                </form>
            </div>
        </div>
    )
}
