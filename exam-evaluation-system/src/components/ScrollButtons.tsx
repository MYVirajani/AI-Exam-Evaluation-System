'use client'

import { useState, useEffect } from 'react'

const ScrollButtons = () => {
  const [showButtons, setShowButtons] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(false)

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Show buttons when scrolled down more than 200px
      setShowButtons(scrollTop > 200)

      // Check if near footer (within 150px of footer)
      const footer = document.querySelector('footer')
      if (footer) {
        const footerRect = footer.getBoundingClientRect()
        const footerTop = window.pageYOffset + footerRect.top
        setIsAtBottom(scrollTop + windowHeight >= footerTop - 50)
      } else {
        setIsAtBottom(scrollTop + windowHeight >= documentHeight - 100)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const scrollToBottom = () => {
    const footer = document.querySelector('footer')
    let scrollTarget = document.documentElement.scrollHeight

    if (footer) {
      // Get footer position and subtract padding (150px before footer)
      const footerRect = footer.getBoundingClientRect()
      const footerTop = window.pageYOffset + footerRect.top
      scrollTarget = footerTop - 350 
    }

    window.scrollTo({
      top: scrollTarget,
      behavior: 'smooth'
    })
  }

  if (!showButtons) return null

  return (
    <>
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(139, 69, 255, 0.6), 0 0 40px rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 30px rgba(139, 69, 255, 0.8), 0 0 60px rgba(59, 130, 246, 0.6);
          }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .scroll-button {
          background: linear-gradient(-45deg, #8b45ff, #3b82f6, #6366f1, #a855f7);
          background-size: 400% 400%;
          animation: gradient-shift 3s ease infinite, pulse-glow 2s ease-in-out infinite;
        }
        
        .scroll-button:hover {
          animation: gradient-shift 1.5s ease infinite, pulse-glow 1s ease-in-out infinite;
          transform: scale(1.1);
        }
        
        .scroll-button-icon {
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
        }
      `}</style>

      <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-2">
        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="scroll-button group relative w-10 h-10 rounded-full focus:outline-none focus:ring-3 focus:ring-purple-300 focus:ring-opacity-50 transition-all duration-300 ease-out"
          aria-label="Scroll to top"
        >
          <svg
            className="scroll-button-icon w-4 h-4 text-white mx-auto transition-transform duration-200 group-hover:translate-y-[-1px]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 15l7-7 7 7"
            />
          </svg>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg">
            Scroll to top
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-2 border-transparent border-l-gray-900"></div>
          </div>
        </button>

        {/* Scroll to Bottom Button */}
        {!isAtBottom && (
          <button
            onClick={scrollToBottom}
            className="scroll-button group relative w-10 h-10 rounded-full focus:outline-none focus:ring-3 focus:ring-purple-300 focus:ring-opacity-50 transition-all duration-300 ease-out"
          aria-label="Scroll to bottom"
          >
            <svg
              className="scroll-button-icon w-4 h-4 text-white mx-auto transition-transform duration-200 group-hover:translate-y-[1px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            
            {/* Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg">
              Scroll to bottom
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
            </div>
          </button>
        )}

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1 right-1 w-0.5 h-0.5 bg-white rounded-full opacity-60 animate-ping"></div>
          <div className="absolute bottom-2 right-4 w-0.5 h-0.5 bg-purple-200 rounded-full opacity-40 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
      </div>
    </>
  )
}

export default ScrollButtons