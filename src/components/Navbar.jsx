'use client'

import { useState, useEffect, useRef } from 'react'
import HusmahLogo from './HusmahLogo'

export default function Navbar({ currentPage, setCurrentPage, user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setIsMenuOpen(false);
  }

  const handleGiveAccess = () => {
    setCurrentPage('giveAccess')
  }

  const handleChangePassword = () => {
    setCurrentPage('changePassword')
  }

  const handleProject = () => {
    setCurrentPage('project')
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto pl-2 pr-4 sm:pl-2 sm:pr-6 lg:pl-2 lg:pr-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Company Name (Desktop) */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="flex-shrink-0">
              <HusmahLogo className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" />
            </div>
            <div className="flex flex-col">
              <span className="flex items-end space-x-2">
                <span className="font-extrabold text-[#3066d9] tracking-wide text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">HUSMA</span>
                <span className="font-extrabold text-[#303030] tracking-wide text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">ENGINEERING</span>
                <span className="font-extrabold text-[#303030] tracking-wide text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">(PVT)</span>
                <span className="font-extrabold text-[#303030] tracking-wide text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">Ltd</span>
              </span>
            </div>
          </div>

          {/* Right side - Logout Button (Desktop) */}
          <div className="hidden md:flex">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-2 py-2 lg:px-3 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:focus:ring-red-500 transition-colors duration-200"
            >
              <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isMenuOpen && (
          <div 
            ref={menuRef}
            className="md:hidden absolute right-4 top-16 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48"
          >
            <div className="py-2">
              {/* User Info (Mobile) */}
              {user && (
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => {
                  handleProject();
                  setIsMenuOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  currentPage === 'project'
                    ? 'text-white bg-blue-600 hover:bg-blue-700'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Project
              </button>
              <button
                onClick={() => {
                  handleGiveAccess();
                  setIsMenuOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  currentPage === 'giveAccess'
                    ? 'text-white bg-blue-600 hover:bg-blue-700'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 715 0z" />
                </svg>
                Give Access
              </button>
              <button
                onClick={() => {
                  handleChangePassword();
                  setIsMenuOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  currentPage === 'changePassword'
                    ? 'text-white bg-green-600 hover:bg-green-700'
                    : 'text-green-600 hover:bg-green-50'
                }`}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                </svg>
                Change Password
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
