'use client'

import { useState, useEffect } from 'react'
import Map from '@/components/Map'
import AddRouteForm from '@/components/AddRouteForm'
import ReviewForm from '@/components/ReviewForm'
import { Plus, LogIn, LogOut, User as UserIcon, MapPin, Car, Bus, Bike, Star } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Route } from '@/lib/types'

export default function Home() {
  const [showAddRoute, setShowAddRoute] = useState(false)
  const [reviewRouteId, setReviewRouteId] = useState<number | null>(null)
  const { user, signInWithGoogle, signOut } = useAuth()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRoutes(data || [])
    } catch (error) {
      console.error('Error fetching routes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'bus': return <Bus size={16} />
      case 'bajaj': return <Bike size={16} />
      default: return <Car size={16} />
    }
  }

  const handleRateClick = (e: React.MouseEvent, routeId: number) => {
    e.stopPropagation()
    if (!user) {
      signInWithGoogle()
    } else {
      setReviewRouteId(routeId)
    }
  }

  return (
    <main className="flex h-screen w-screen relative overflow-hidden">
      <div className={clsx(
        "absolute top-0 left-0 w-full md:w-[350px] h-1/2 md:h-full bottom-0 md:bottom-auto bg-white dark:bg-slate-900 shadow-lg z-[1000] p-4 flex flex-col transition-transform duration-300 ease-in-out",
        showAddRoute ? "-translate-x-full md:-translate-x-full" : "translate-x-0"
      )}>
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-primary mb-1">Weraj Ale</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Find and share public transport routes.</p>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {user.user_metadata.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={16} className="text-slate-500" />
                )}
              </div>
              <button onClick={signOut} className="text-slate-400 hover:text-red-500 transition-colors" title="Sign Out">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              <LogIn size={18} />
              Login
            </button>
          )}
        </div>

        {/* Route list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {loading ? (
            <p className="text-center text-slate-500">Loading routes...</p>
          ) : routes.length === 0 ? (
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">No routes found. Be the first to add one!</p>
            </div>
          ) : (
            routes.map(route => (
              <div key={route.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary transition-colors cursor-pointer bg-white dark:bg-slate-800 shadow-sm group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    {getVehicleIcon(route.vehicle_type)}
                    <span className="capitalize">{route.vehicle_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleRateClick(e, route.id)}
                      className="text-slate-400 hover:text-yellow-500 opacity-0 group-hover:opacity-100 transition-all"
                      title="Rate this route"
                    >
                      <Star size={16} />
                    </button>
                    <span className="text-sm font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                      {route.price} ETB
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-1">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-medium">{route.start_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="absolute -left-[5px] bottom-1 w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-medium">{route.end_name}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Map Component */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Map routes={routes} />
      </div>

      {/* Add Route Button */}
      <button
        className="absolute bottom-8 right-8 z-[1000] bg-primary hover:bg-primary-hover text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
        aria-label="Add Route"
        onClick={() => {
          if (!user) {
            signInWithGoogle()
          } else {
            setShowAddRoute(true)
          }
        }}
      >
        <Plus size={24} />
      </button>

      {showAddRoute && (
        <AddRouteForm
          onClose={() => setShowAddRoute(false)}
          onSuccess={() => {
            fetchRoutes()
            setShowAddRoute(false)
          }}
        />
      )}

      {reviewRouteId && (
        <ReviewForm
          routeId={reviewRouteId}
          onClose={() => setReviewRouteId(null)}
        />
      )}
    </main>
  )
}
