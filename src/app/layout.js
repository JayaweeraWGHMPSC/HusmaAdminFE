'use client';

import { Inter } from 'next/font/google'
import { useState } from 'react'
import './globals.css'
import Navbar from '@/components/Navbar'
import AddNew from '@/components/Addnew'
import Login from '@/components/Login'
import Changeps from '@/components/Changeps'
import Access from '@/components/Access'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const [currentPage, setCurrentPage] = useState('project'); // Default to project page

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

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main>
          {renderCurrentPage()}
        </main>
      </body>
    </html>
  )
}
