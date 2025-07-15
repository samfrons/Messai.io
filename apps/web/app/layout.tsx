import type { Metadata } from 'next'
import { Inter, Playfair_Display, Crimson_Text } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '../components/ConditionalLayout'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial']
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  preload: false, // Only preload primary font
  fallback: ['serif']
})

const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-crimson',
  preload: false, // Only preload primary font
  fallback: ['serif']
})

export const metadata: Metadata = {
  title: 'MESSAi - AI-Powered MFC Research Platform',
  description: 'Advanced platform for microbial fuel cell research with AI predictions and 3D modeling',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable} ${crimsonText.variable}`}>
      <body className="min-h-screen bg-white dark:bg-gray-900 antialiased">
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  )
}