'use client'

import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./MapInner'), {
    ssr: false,
    loading: () => <div style={{ height: '100%', width: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>
})

export default Map
