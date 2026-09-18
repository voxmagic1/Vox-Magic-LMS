import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'Vox Magic — Vocal Music Department | Damichromes School of Music (DSML)',
  description: 'Vox Magic is the premium Vocal Music Department of Damichromes School of Music Limited (DSML). Cast the spell with the rhythm through our Vocal Transformation Program, masterclasses, and world-class vocal coaching led by Damian Nworgu.',
  keywords: ['Vox Magic', 'DSML', 'vocal training', 'singing lessons', 'vocal coach Nigeria', 'Damian Nworgu', 'Vocal Transformation Program', 'music school'],
  openGraph: {
    title: 'Vox Magic — Cast The Spell With The Rhythm',
    description: 'Premium vocal training and the Vocal Transformation Program at Damichromes School of Music (DSML).',
    type: 'website',
    images: ['/assets/logo.png'],
  },
  icons: { icon: '/assets/logo.png' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
