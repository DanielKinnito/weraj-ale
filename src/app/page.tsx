'use client'

import { useState } from 'react'
import Map from '@/components/Map'
import AddRouteForm from '@/components/AddRouteForm'
import { Plus } from 'lucide-react'
import clsx from 'clsx'

export default function Home() {
  const [showAddRoute, setShowAddRoute] = useState(false)

  return (
    <main className="flex h-screen w-screen relative overflow-hidden">
      <div className={clsx(
        "absolute top-0 left-0 w-full md:w-[350px] h-1/2 md:h-full bottom-0 md:bottom-auto bg-white dark:bg-slate-900 shadow-lg z-[1000] p-4 flex flex-col transition-transform duration-300 ease-in-out",
        showAddRoute ? "-translate-x-full md:-translate-x-full" : "translate-x-0"
      )}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary mb-1">Weraj Ale</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Find and share public transport routes.</p>
        </div>

        {/* Route list placeholder */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400">No routes selected.</p>
        </div>
      </div>

      <div className="flex-1 h-full z-0">
        <Map />
      </div>

      <button
        className="absolute bottom-8 right-8 z-[1000] bg-primary hover:bg-primary-hover text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
        aria-label="Add Route"
        onClick={() => setShowAddRoute(true)}
      >
        <Plus size={24} />
      </button>

      {showAddRoute && (
        <AddRouteForm onClose={() => setShowAddRoute(false)} />
      )}
    </main>
  )
}
