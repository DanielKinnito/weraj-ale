'use client'

import { useState, useEffect } from 'react'
import Map from '@/components/Map'
import AddRouteForm from '@/components/AddRouteForm'
import ReviewForm from '@/components/ReviewForm'
import { Plus, LogIn, LogOut, User as UserIcon, MapPin, Car, Bus, Bike, Star, Menu, X, ChevronLeft, ChevronRight, Sun, Moon, Edit, Trash2, BusFront } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Route } from '@/lib/types'
import { deleteRoute } from '@/app/actions'

export default function Home() {
  const [showAddRoute, setShowAddRoute] = useState(false)
  const [reviewRouteId, setReviewRouteId] = useState<number | null>(null)
  const { user, signInWithGoogle, signOut } = useAuth()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)

  useEffect(() => {
    fetchRoutes()
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

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

  const handleEditClick = (e: React.MouseEvent, route: Route) => {
    e.stopPropagation()
    setEditingRoute(route)
    setShowAddRoute(true)
  }

  const handleDeleteClick = async (e: React.MouseEvent, routeId: number) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this route? This action cannot be undone.')) return

    if (!user) return

    try {
      const result = await deleteRoute(routeId, user.id)
      if (result.success) {
        alert(result.message)
        fetchRoutes()
        if (selectedRoute?.id === routeId) {
          setSelectedRoute(null)
        }
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Error deleting route:', error)
      alert('Failed to delete route')
    }
  }

  const handleRouteClick = (route: Route) => {
    setSelectedRoute(route)
    // On mobile, close sidebar when route is clicked to see map
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }

  return (
    <main className="flex h-screen w-screen relative overflow-hidden">
      {/* Sidebar Toggle Button (Mobile/Desktop) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 left-4 z-[1100] bg-white dark:bg-slate-800 p-2 rounded-md shadow-md md:hidden"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 z-[1100] bg-white dark:bg-slate-800 p-2 rounded-full shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className={clsx(
        "absolute top-0 left-0 h-full bg-white dark:bg-slate-900 shadow-lg z-[1000] flex flex-col transition-transform duration-300 ease-in-out w-full md:w-[350px]",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-primary mb-1 flex items-center gap-2">
              <BusFront size={28} />
              Weraj Ale
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Find and share public transport routes.</p>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Auth Section */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {user.user_metadata.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={16} className="text-slate-500" />
                  )}
                </div>
                <span className="text-sm font-medium truncate max-w-[150px]">{user.email}</span>
              </div>
              <button onClick={signOut} className="text-slate-400 hover:text-red-500 transition-colors" title="Sign Out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover p-2 rounded-md transition-colors"
            >
              <LogIn size={18} />
              Sign in with Google
            </button>
          )}
        </div>

        {/* Route list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-center text-slate-500">Loading routes...</p>
          ) : routes.length === 0 ? (
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">No routes found. Be the first to add one!</p>
            </div>
          ) : (
            routes.map(route => (
              <div
                key={route.id}
                onClick={() => handleRouteClick(route)}
                className={clsx(
                  "p-3 border rounded-lg transition-all cursor-pointer shadow-sm group relative",
                  selectedRoute?.id === route.id
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    {getVehicleIcon(route.vehicle_type)}
                    <span className="capitalize">{route.vehicle_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {user && user.id === route.user_id && (
                      <>
                        <button
                          onClick={(e) => handleEditClick(e, route)}
                          className="text-slate-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all mr-2"
                          title="Edit this route"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, route.id)}
                          className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all mr-2"
                          title="Delete this route"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
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
                  {route.updated_at && (
                    <div className="text-xs text-slate-400 mt-1 italic">
                      Edited {new Date(route.updated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Toggle Sidebar Button (Desktop) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:flex absolute -right-10 top-1/2 transform -translate-y-1/2 bg-white dark:bg-slate-900 p-2 rounded-r-md shadow-md border-y border-r border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary"
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Map Component */}
      <div className={clsx(
        "absolute inset-0 w-full h-full z-0 transition-all duration-300",
        isSidebarOpen ? "md:pl-[350px]" : "pl-0"
      )}>
        <Map routes={routes} selectedRoute={selectedRoute} />
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
          onClose={() => {
            setShowAddRoute(false)
            setEditingRoute(null)
          }}
          onSuccess={() => {
            fetchRoutes()
            setShowAddRoute(false)
            setEditingRoute(null)
          }}
          initialData={editingRoute}
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
