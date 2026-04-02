import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import './globals.css'
import HeaderWrapper from '@/components/header-wrapper'
import { Toaster } from 'react-hot-toast'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'HomeHarvest — Farm Fresh, Delivered Local',
  description:
    'Hyperlocal farm-to-home food marketplace for Thrissur, Kerala, India. Fresh vegetables, country chicken, nadan fish, and more — straight from local farms to your table.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const messages = await getMessages()

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <HeaderWrapper />
          <main className="flex-1">{children}</main>
          <Toaster position="top-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
