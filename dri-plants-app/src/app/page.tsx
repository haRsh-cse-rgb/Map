'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the main component to avoid SSR issues with Highcharts
const DRIMapApp = dynamic(() => import('@/components/DRIMapApp'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading map...</div>
})

export default function Home() {
  return <DRIMapApp />
}