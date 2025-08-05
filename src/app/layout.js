'use client';

import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react'
import './globals.css'
import Navbar from '@/components/Navbar'
import AddNew from '@/components/Addnew'
import Login from '@/components/Login'
import Changeps from '@/components/Changeps'
import Access from '@/components/Access'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const [currentPage, setCurrentPage] = useState('project'); // Default to project page
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('lastLoginAt');
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('project'); // Reset to default page
  };

  // Render the appropriate component based on current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'project':
        return <AddNew />;
      case 'giveAccess':
        return <Access />;
      case 'changePassword':
        return <Changeps />;
      default:
        return <AddNew />;
    }
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
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          user={user}
          onLogout={handleLogout}
        />
        <main>
          {renderCurrentPage()}
        </main>
      </body>
    </html>
  )
}
