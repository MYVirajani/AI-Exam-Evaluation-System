// import { siteConfig } from '@/config/site'
// import Head from 'next/head'
// import { ReactNode } from 'react'
// import Header from '../Header'

// interface LayoutProps {
//   children: ReactNode
//   title?: string
//   description?: string
// }

// const Layout = ({ 
//   children,
//   title = siteConfig.title,
//   description = siteConfig.description
// }: LayoutProps) => {
//   return (
//     <>
//       <Head>
//         <title>{title}</title>
//         <meta name="description" content={description} />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>
      
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <main className="max-w-6xl mx-auto p-10">
//           {children}
//         </main>
//       </div>
//     </>
//   )
// }

// export default Layout

import { siteConfig } from '@/config/site'
import Head from 'next/head'
import { ReactNode } from 'react'
import Header from '../Header'
import Footer from '../Footer'
import ScrollButtons from '../ScrollButtons'
interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

const Layout = ({
  children,
  title = siteConfig.title,
  description = siteConfig.description,
}: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Header */}
        <Header />

        {/* Main content */}
        <main className="flex-grow w-full">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Scroll Buttons */}
        <ScrollButtons />
      </div>
    </>
  )
}

export default Layout