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
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list')

  // Map Picking State
  const [pickingField, setPickingField] = useState<'start' | 'end' | 'stop' | null>(null)
  const [pickedLocation, setPickedLocation] = useState<{ field: 'start' | 'end' | 'stop', lat: number, lng: number, name: string } | null>(null)

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
    setActiveTab('add')
    setIsSidebarOpen(true)
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

  const handleMapClick = async (lat: number, lng: number) => {
    if (!pickingField) return

    // Reverse geocode
    const { reverseGeocode } = await import('./actions')
    const result = await reverseGeocode(lat, lng)
    const name = result.success ? result.name : `${lat.toFixed(4)}, ${lng.toFixed(4)}`

    setPickedLocation({ field: pickingField, lat, lng, name })
    setPickingField(null) // Exit picking mode

    // On mobile, open sidebar to show form again
    if (window.innerWidth < 768) {
      setIsSidebarOpen(true)
    }
  }

  const handlePickLocation = (field: 'start' | 'end' | 'stop') => {
    setPickingField(field)
    // On mobile, close sidebar to show map
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }

  const handleSuccess = () => {
    fetchRoutes()
    setActiveTab('list')
    setEditingRoute(null)
    setPickedLocation(null) // Clear picked location after success
  }

  return (
    <main className="flex h-screen w-screen relative overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 z-[2000] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />
          </button>
          <div className="flex items-center gap-2">
            <BusFront className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Weraj Ale
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-slate-200" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium hidden md:block text-slate-700 dark:text-slate-200">
                {user.email?.split('@')[0]}
              </span>
              <form action="/auth/signout" method="post">
                <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors" title="Sign Out">
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          ) : (
            <form action="/auth/signin" method="post">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
                <LogIn className="w-4 h-4" />
                <span className="hidden md:inline">Sign In</span>
              </button>
            </form>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <div className={clsx(
        "absolute top-0 left-0 h-full bg-white dark:bg-slate-900 shadow-lg z-[1000] flex flex-col transition-transform duration-300 ease-in-out w-full md:w-[350px] pt-16",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            className={clsx("flex-1 p-3 text-sm font-medium transition-colors", activeTab === 'list' ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")}
            onClick={() => setActiveTab('list')}
          >
            Routes
          </button>
          <button
            className={clsx("flex-1 p-3 text-sm font-medium transition-colors", activeTab === 'add' ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")}
            onClick={() => {
              setActiveTab('add')
              setEditingRoute(null)
            }}
          >
            Add Route
          </button>
        </div>

        <div className="flex-1 overflow-y-auto relative">
          {/* List Tab */}
          <div className={clsx(
            "absolute inset-0 overflow-y-auto p-4 transition-opacity duration-300",
            activeTab === 'list' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          )}>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : routes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No routes found. Be the first to add one!
              </div>
            ) : (
              <div className="space-y-4">
                {routes.map(route => (
                  <div
                    key={route.id}
                    onClick={() => handleRouteClick(route)}
                    className={clsx(
                      "bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border transition-all cursor-pointer hover:shadow-md",
                      selectedRoute?.id === route.id ? "border-primary ring-1 ring-primary" : "border-slate-200 dark:border-slate-700 hover:border-primary/50"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300">
                          {getVehicleIcon(route.vehicle_type)}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-white capitalize">
                          {route.vehicle_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{route.price} ETB</span>
                        {user && user.id === route.user_id && (
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => handleEditClick(e, route)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-blue-500 transition-colors"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(e, route.id)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-1">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-green-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{route.start_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="absolute -left-[5px] bottom-1 w-2 h-2 rounded-full bg-red-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{route.end_name}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {route.avg_rating ? route.avg_rating.toFixed(1) : 'New'}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({route.rating_count || 0})
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleRateClick(e, route.id)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Rate
                      </button>
                    </div>

                    {route.updated_at && (
                      <div className="text-xs text-slate-400 mt-2 italic border-t border-slate-100 dark:border-slate-700 pt-2">
                        Updated {new Date(route.updated_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Tab */}
          <div className={clsx(
            "absolute inset-0 overflow-y-auto p-0 transition-opacity duration-300",
            activeTab === 'add' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          )}>
            <AddRouteForm
              onClose={() => {
                setActiveTab('list')
                setEditingRoute(null)
              }}
              onSuccess={handleSuccess}
              initialData={editingRoute}
              isEmbedded={true}
              onPickLocation={handlePickLocation}
              pickedLocation={pickedLocation}
            />
          </div>
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
        <Map
          routes={routes}
          selectedRoute={selectedRoute}
          onMapClick={handleMapClick}
          pickingMode={!!pickingField}
        />
      </div>

      {/* Add Route Button (Floating Action Button) - Only show if NOT in add tab */}
      {activeTab !== 'add' && (
        <button
          className="absolute bottom-8 right-8 z-[1000] bg-primary hover:bg-primary-hover text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
          aria-label="Add Route"
          onClick={() => {
            if (!user) {
              signInWithGoogle()
            } else {
              setActiveTab('add')
              setIsSidebarOpen(true)
            }
          }}
        >
          <Plus size={24} />
        </button>
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
