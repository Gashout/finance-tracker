/**
 * @file Header.tsx
 * @description Main application header component with navigation and user profile dropdown
 * 
 * This component serves as the top navigation bar for the application, featuring:
 * - Application logo and title
 * - Mobile navigation toggle button
 * - User profile information and dropdown menu with username display
 * - Logout functionality
 * 
 * The header adapts to different screen sizes, showing a hamburger menu on mobile
 * and full navigation on desktop screens. The user's name is prominently displayed
 * in the profile section, replacing the generic icon with personalized information.
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Button,
  Card,
  CardContent,
} from '../ui'
import { useAuth } from '../../context/AuthContext'
import { ChevronDown, Menu, X, LogOut, User } from 'lucide-react'

/**
 * Props for the Header component
 * 
 * @property {Function} toggleSidebar - Function to toggle sidebar visibility on mobile
 * @property {boolean} isSidebarOpen - Current state of sidebar visibility
 */
interface HeaderProps {
  toggleSidebar: () => void
  isSidebarOpen: boolean
}

/**
 * @component Header
 * @description Application header with responsive navigation and user dropdown
 * 
 * @param {HeaderProps} props - Component props
 * @returns {JSX.Element} Rendered Header component
 */
const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  /**
   * @description Access the authentication context to get user data, loading state, and functions
   * 
   * This component uses the AuthContext via the useAuth() hook to:
   * 1. Access current authenticated user data (user object)
   * 2. Access the loading state to handle initial data fetching
   * 3. Access the logout function for handling user sign-out
   * 
   * The user object contains:
   * - id: User's unique identifier
   * - username: User's login name
   * - email: User's email address
   * - first_name: User's first name (optional)
   * - last_name: User's last name (optional)
   * 
   * @dataflow The user data flows from:
   * AuthProvider → AuthContext → useAuth() hook → Header component
   * 
   * @loading_state
   * The loading state is critical for proper rendering during authentication state changes:
   * - true: Initial data fetch or during authentication operations
   * - false: Authentication state resolved (either logged in or not)
   */
  const { user, loading, logout } = useAuth()
  
  // State to control user dropdown menu visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  /**
   * @function toggleDropdown
   * @description Toggles the user profile dropdown visibility
   */
  const toggleDropdown = () => setIsDropdownOpen(prev => !prev)
  
  /**
   * @function handleLogout
   * @description Handles user logout and closes dropdown
   * 
   * This function:
   * 1. Calls the logout function from AuthContext
   * 2. Closes the dropdown menu
   * 3. Redirects to login page (handled by AuthContext)
   */
  const handleLogout = async () => {
    try {
      await logout()
      setIsDropdownOpen(false)
      // No need to navigate here as the AuthContext will handle redirection
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  /**
   * @function getDisplayName
   * @description Returns the formatted display name for the user with comprehensive error handling
   * 
   * This function determines the best name to display for the user by checking:
   * 1. First and last name if both are available and non-empty
   * 2. First name if only that is available and non-empty
   * 3. Username as a fallback if available and non-empty
   * 4. "User" as a final fallback if no valid user data is available
   * 
   * @returns {string} Formatted display name for the user
   * 
   * @error_handling
   * - Returns "User" if user object is null/undefined (during loading or after logout)
   * - Validates string existence and length before using values
   * - Handles empty strings by providing appropriate fallbacks
   * - Ensures component never displays empty values or crashes
   * 
   * @lifecycle_safety
   * These checks are necessary because:
   * - During initial render, AuthContext may still be loading user data
   * - After failed login or logout, user data becomes null
   * - API responses might contain empty strings instead of null values
   * - User object structure might change or have missing properties
   */
  const getDisplayName = (): string => {
    // Primary check: Handle null/undefined user object
    if (!user) {
      return 'User'; // Default fallback if no user data is available
    }
    
    // Check for first and last name - with validation for non-empty strings
    if (
      typeof user.first_name === 'string' && 
      user.first_name.trim().length > 0 && 
      typeof user.last_name === 'string' && 
      user.last_name.trim().length > 0
    ) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    // Check for first name only - with validation for non-empty string
    if (typeof user.first_name === 'string' && user.first_name.trim().length > 0) {
      return user.first_name;
    }
    
    // Check for username - with validation for non-empty string
    if (typeof user.username === 'string' && user.username.trim().length > 0) {
      return user.username;
    }
    
    // Final fallback if all user data fields are empty or invalid
    return 'User';
  }

  /**
   * @function getInitials
   * @description Safely extracts user initials from name for the avatar with comprehensive error handling
   * 
   * This function extracts initials for the user avatar with multiple safety checks:
   * 1. First checks if user object exists (handles loading state)
   * 2. Validates that first_name and last_name are non-empty strings before accessing characters
   * 3. Validates that username is a non-empty string before accessing characters
   * 4. Provides fallbacks at each step to prevent runtime errors
   * 
   * @returns {string} User's initials to display in the avatar
   * 
   * @error_handling
   * - Returns "U" if user is null/undefined (during loading or after logout)
   * - Validates string existence and length before accessing characters
   * - Handles empty strings by providing appropriate fallbacks
   * - Ensures component never crashes due to property access on undefined
   * 
   * @lifecycle_safety
   * These checks are necessary because:
   * - During initial render, user may be null while authentication state is loading
   * - After logout, user becomes null but component may still be mounted
   * - API might return incomplete user data with missing fields
   * - Type definitions allow optional fields that may be undefined
   */
  const getInitials = (): string => {
    // Primary check: Handle null/undefined user object (during loading or after logout)
    if (!user) {
      return 'U'; // Default fallback if no user data is available
    }
    
    // Check for first and last name - with validation for non-empty strings
    if (
      typeof user.first_name === 'string' && 
      user.first_name.length > 0 && 
      typeof user.last_name === 'string' && 
      user.last_name.length > 0
    ) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    
    // Check for first name only - with validation for non-empty string
    if (typeof user.first_name === 'string' && user.first_name.length > 0) {
      return `${user.first_name[0]}`.toUpperCase();
    }
    
    // Check for username - with validation for non-empty string
    if (typeof user.username === 'string' && user.username.length > 0) {
      return user.username[0].toUpperCase();
    }
    
    // Final fallback if all user data fields are empty or invalid
    return 'U';
  }

  return (
    <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Left section: Logo and app name */}
        <div className="flex items-center">
          {/* Mobile menu button - only visible on small screens */}
          <button
            type="button"
            className="text-gray-500 hover:text-gray-600 lg:hidden mr-4"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          
          {/* App logo and title */}
          <Link to="/" className="flex items-center">
            <div className="bg-blue-600 text-white p-1 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="ml-2 text-xl font-semibold hidden sm:block">Finance Tracker</span>
          </Link>
        </div>

        {/* Right section: User profile and dropdown */}
        <div className="relative">
          {/* User profile button */}
          <Button
            variant="ghost"
            onClick={toggleDropdown}
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            {/* User avatar with initials or loading indicator */}
            <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center">
              {loading ? (
                /* Loading indicator when user data is being fetched */
                <span className="animate-pulse">...</span>
              ) : (
                /* User initials with comprehensive error handling */
                getInitials()
              )}
            </div>
            
            {/* Username - only visible on larger screens */}
            <span className="hidden sm:block font-medium">
              {loading ? 'Loading...' : getDisplayName()}
            </span>
            
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </Button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <Card className="absolute right-0 mt-1 w-56 z-50 shadow-md">
              <CardContent className="p-0">
                {/* User info section with safe rendering of user data */}
                <div className="py-2 px-4 border-b border-gray-100">
                  {/* Display name with safe fallback via getDisplayName() */}
                  <p className="text-sm font-medium">{getDisplayName()}</p>
                  
                  {/* Username with optional chaining for safety */}
                  <p className="text-xs text-gray-500 truncate">
                    {typeof user?.username === 'string' && user.username.trim().length > 0 
                      ? user.username 
                      : 'No username available'}
                  </p>
                  
                  {/* Email with optional chaining and fallback */}
                  <p className="text-xs text-gray-500 truncate">
                    {typeof user?.email === 'string' && user.email.trim().length > 0 
                      ? user.email 
                      : 'No email available'}
                  </p>
                </div>
                
                <nav className="py-2">
                  {/* Profile link */}
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  
                  {/* Logout button */}
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full text-left text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </nav>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
