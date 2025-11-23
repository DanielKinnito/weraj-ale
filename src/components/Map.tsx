'use client'

import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./MapInner'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
})

export default Map
