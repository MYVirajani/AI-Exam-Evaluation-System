// import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
// import './globals.css'

// const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = {
//   title: 'AutoEval360',
//   description: 'Exam evaluation web application',
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>{children}</body>
//     </html>
//   )
// }
import { siteConfig } from '@/config/site';
import type { Metadata } from 'next';
import './globals.css'

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  themeColor: siteConfig.theme.colors.primary,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}