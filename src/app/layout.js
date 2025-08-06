'use client';

import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react'
import './globals.css'
import Navbar from '@/components/Navbar'
import Login from '@/components/Login'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Check if user is already logged in on page load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('lastLoginAt');
      }
    }
    setIsLoading(false);
  }, []);

  // Handle successful login
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Show custom popup for logout confirmation
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('lastLoginAt');
    setUser(null);
    setIsAuthenticated(false);
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <main>
            <Login onLoginSuccess={handleLoginSuccess} />
          </main>
        </body>
      </html>
    );
  }

  // Show dashboard if authenticated
  // Import Left sidebar
  // eslint-disable-next-line @next/next/no-head-element
  const Left = require('../components/Left').default;
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar 
          user={user}
          onLogout={handleLogout}
        />
        <div className="flex">
          {/* Fixed Sidebar only on md+ screens */}
          <div className="hidden md:block fixed left-0 top-16 h-screen z-30">
            <Left user={user} />
          </div>
          {/* Main Content with left margin to account for fixed sidebar */}
          <main className="flex-1 pt-20 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-24 2xl:px-48 md:ml-64">
            {children}
          </main>
        </div>
        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <>
            {/* Overlay to block background interaction */}
            <div className="fixed inset-0 bg-transparent z-40 pointer-events-auto" />
            <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
              <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-xs mx-4 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 text-center">Confirm Logout</h3>
                <p className="text-gray-700 mb-6 text-center">Are you sure you want to logout?</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={confirmLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Yes, Logout
                  </button>
                  <button
                    onClick={cancelLogout}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </body>
    </html>
  )
}
