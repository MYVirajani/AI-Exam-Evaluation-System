import { siteConfig } from '@/config/site'
import Head from 'next/head'
import { ReactNode } from 'react'
import Header from '../Header'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

const Layout = ({ 
  children,
  title = siteConfig.title,
  description = siteConfig.description
}: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto p-8">
          {children}
        </main>
      </div>
    </>
  )
}

export default Layout