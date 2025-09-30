/**
 * @file Layout.tsx
 * @description Main application layout wrapper component
 * 
 * This component serves as the primary layout structure for authenticated pages,
 * combining the Header, Sidebar, and main content area. It:
 * - Manages responsive behavior between mobile and desktop views
 * - Handles sidebar visibility state
 * - Provides consistent spacing and structure for all authenticated pages
 * - Creates a cohesive user experience across the application
 * 
 * The layout is designed with a mobile-first approach, adapting to larger screens
 * through responsive utility classes.
 */

import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Header from './Header'
import Sidebar from './Sidebar'

/**
 * @component Layout
 * @description Main application layout wrapper that includes header, sidebar and content area
 * 
 * This component:
 * 1. Wraps authenticated pages with consistent layout
 * 2. Handles responsive behavior for mobile/desktop
 * 3. Manages sidebar visibility state
 * 4. Protects routes by checking authentication status
 * 
 * @returns {JSX.Element} The complete layout with header, sidebar and content area
 */
const Layout: React.FC = () => {
  // Get authentication state from context
  const { isAuthenticated, loading, user } = useAuth()
  const navigate = useNavigate()
  
  // State for sidebar visibility (primarily for mobile)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  /**
   * @function toggleSidebar
   * @description Toggles the sidebar visibility state
   */
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev)
  
  /**
   * @function closeSidebar
   * @description Closes the sidebar (used after navigation on mobile)
   */
  const closeSidebar = () => setIsSidebarOpen(false)
  
  /**
   * Effect to close sidebar when window is resized to desktop size
   * This prevents the sidebar from staying open when transitioning from mobile to desktop
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsSidebarOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  /**
   * Effect to redirect to login if user is not authenticated
   * This provides an additional layer of protection for authenticated routes
   */
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, loading, navigate])
  
  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  // If not authenticated, don't render anything (redirect will happen via effect)
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed header at the top */}
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      {/* Sidebar for navigation */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      
      {/* Overlay to close sidebar when clicking outside on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Main content area */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Render the child route components */}
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
