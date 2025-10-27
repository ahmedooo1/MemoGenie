import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MemoGenie 🤖 - Your Intelligent Writing Companion',
  description: 'MemoGenie - AI-powered assistant forgeneral knowledge. Write smarter, not harder.',
  keywords: ['AI', 'memo', 'notes', 'PDF summarization', 'academic writing', 'GPT', 'Gemini', 'MemoGenie', 'assistant'],
  authors: [{ name: 'MemoGenie', url: 'https://memogenie.aaweb.fr' }],
  creator: 'ahmedooo_1 (Ahmad Ahmad)',
  publisher: 'MemoGenie',
  applicationName: 'MemoGenie',
  // metadataBase used by Next to resolve relative Open Graph / twitter image URLs
  metadataBase: new URL('https://memogenie.aaweb.fr'),
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  }
  ,
  openGraph: {
    title: 'MemoGenie 🤖 - Your Intelligent Writing Companion',
    description: 'MemoGenie helps you read, summarize and generate notes from PDFs and more. Built for students and researchers.',
  url: 'https://memogenie.aaweb.fr/',
    siteName: 'MemoGenie',
    images: [
      {
        url: '/favicon.png',
        width: 800,
        height: 600,
        alt: 'MemoGenie logo'
      }
    ],
    locale: 'fr_FR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MemoGenie 🤖',
    description: 'AI assistant to summarize PDFs, draft notes and improve your writing.',
    images: ['/favicon.png']
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  alternates: {
    canonical: 'https://memogenie.aaweb.fr/'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MemoGenie",
    "url": "https://memogenie.aaweb.fr/",
    "description": "MemoGenie helps you read, summarize and generate notes from PDFs and more. Built for students and researchers.",
    "publisher": {
      "@type": "Organization",
      "name": "MemoGenie",
      "url": "https://memogenie.aaweb.fr/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://memogenie.aaweb.fr/favicon.png"
      }
    }
  });

  return (
    <html lang="fr">
      <body className={inter.className}>
        {/* JSON-LD structured data for SEO */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
        {children}
      </body>
    </html>
  )
}
