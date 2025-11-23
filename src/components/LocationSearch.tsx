import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { searchLocation } from '@/app/actions'

interface Location {
    name: string
    lat: number
    lng: number
}

interface LocationSearchProps {
    placeholder: string
    onSelect: (location: Location) => void
    defaultValue?: string
    className?: string
}

export default function LocationSearch({ placeholder, onSelect, defaultValue = '', className }: LocationSearchProps) {
    const [query, setQuery] = useState(defaultValue)
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setQuery(defaultValue)
    }, [defaultValue])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [wrapperRef])

    const handleSearch = async (value: string) => {
        setQuery(value)
        if (value.length < 3) {
            setResults([])
            setIsOpen(false)
            return
        }

        setLoading(true)
        setIsOpen(true)

        try {
            const result = await searchLocation(value)
            if (result.success) {
                setResults(result.data)
            } else {
                setResults([])
            }
        } catch (error) {
            console.error('Error searching location:', error)
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (feature: any) => {
        const location: Location = {
            name: feature.properties.name || feature.properties.label,
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0]
        }
        setQuery(location.name)
        onSelect(location)
        setIsOpen(false)
    }

    return (
        <div ref={wrapperRef} className={clsx("relative", className)}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={placeholder}
                    className="w-full p-3 pl-10 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" size={18} />
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 max-h-60 overflow-y-auto">
                    {results.map((feature, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelect(feature)}
                            className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-start gap-3 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                        >
                            <MapPin className="text-slate-400 mt-1 flex-shrink-0" size={16} />
                            <div>
                                <div className="font-medium text-slate-800 dark:text-slate-200">
                                    {feature.properties.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {feature.properties.label}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
