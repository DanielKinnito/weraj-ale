'use client'

import { useState } from 'react'
import { X, Star } from 'lucide-react'
import { submitReview } from '@/app/actions_review'

interface ReviewFormProps {
    routeId: number
    onClose: () => void
}

export default function ReviewForm({ routeId, onClose }: ReviewFormProps) {
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await submitReview(routeId, rating, comment)

            if (!result.success) {
                throw new Error(result.message)
            }

            alert(result.message)
            onClose()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to submit review'
            alert(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] backdrop-blur-[4px]">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-[90%] max-w-[400px] shadow-xl animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Rate this Route</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`transition-colors ${star <= rating ? 'text-yellow-400' : 'text-slate-300'}`}
                            >
                                <Star size={32} fill={star <= rating ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>

                    <textarea
                        placeholder="Share your experience (optional)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="p-3 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px] resize-none"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary-hover text-white p-2 rounded-md font-semibold disabled:opacity-70"
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    )
}
