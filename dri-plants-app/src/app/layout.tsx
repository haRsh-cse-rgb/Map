import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DRI Plants in India',
  description: 'Interactive map showing DRI plants and biomass availability across India',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://code.highcharts.com/maps/highmaps.js"></script>
        <script src="https://code.highcharts.com/maps/modules/exporting.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}