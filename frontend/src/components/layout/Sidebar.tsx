/**
 * @file Sidebar.tsx
 * @description Application sidebar navigation component
 * 
 * This component provides the main navigation for the application, featuring:
 * - Navigation links to main sections of the app
 * - Visual indicators for active routes
 * - Responsive design that works with the mobile toggle
 * - Icon and text labels for better usability
 * 
 * The sidebar is designed to be collapsible on mobile devices and fixed on desktop,
 * providing a consistent navigation experience across different screen sizes.
 */

import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  User, 
  Settings,
  CreditCard
} from 'lucide-react'

/**
 * Props for the Sidebar component
 * 
 * @property {boolean} isOpen - Whether the sidebar is open (mainly for mobile)
 * @property {Function} closeSidebar - Function to close the sidebar on mobile after navigation
 */
interface SidebarProps {
  isOpen: boolean
  closeSidebar: () => void
}

/**
 * Navigation item structure
 * 
 * @property {string} path - URL path for the navigation item
 * @property {string} label - Display text for the navigation item
 * @property {React.ReactNode} icon - Icon component to display
 * @property {boolean} [end] - Whether to match the path exactly (for home route)
 */
interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  end?: boolean
}

/**
 * @component Sidebar
 * @description Main navigation sidebar with links to app sections
 * 
 * @param {SidebarProps} props - Component props
 * @returns {JSX.Element} Rendered Sidebar component
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  // NavLink handles active state internally
  
  /**
   * Navigation items array
   * Each item defines a main navigation option in the sidebar
   * 
   * The order of items here determines their display order in the UI
   * Icons are chosen to visually represent the section's purpose
   */
  const navItems: NavItem[] = [
    {
      path: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      end: true // Exact match for home route
    },
    {
      path: '/transactions',
      label: 'Transactions',
      icon: <Receipt size={20} />
    },
    {
      path: '/budgets',
      label: 'Budgets',
      icon: <PiggyBank size={20} />
    },
    {
      path: '/categories',
      label: 'Categories',
      icon: <CreditCard size={20} />
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: <User size={20} />
    }
    // Settings option removed as requested
  ]

  // Using NavLink's isActive prop instead of a custom function

  return (
    <aside 
      className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-20
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <nav className="px-4 py-6">
        <ul className="space-y-1">
          {/* Map through navigation items to create links */}
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.end}
                onClick={closeSidebar}
                className={({ isActive }) => `
                  flex items-center px-3 py-2.5 rounded-md w-full
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {/* Icon with consistent spacing */}
                <span className="mr-3 text-inherit">
                  {item.icon}
                </span>
                
                {/* Navigation label */}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* App version info at bottom of sidebar */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="text-xs text-gray-500 text-center">
          Finance Tracker v1.0.0
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
