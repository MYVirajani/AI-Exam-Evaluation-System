'use client'
import { siteConfig } from '@/config/site'

export default function Home() {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Welcome to {siteConfig.title}
      </h2>
      <p className="text-gray-600">
        This is the home page of our exam evaluation system.
      </p>
    </>
  )
}