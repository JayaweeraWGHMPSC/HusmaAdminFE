import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import AddNew from '@/components/Addnew'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Husmah Engineering Admin Dashboard',
  description: 'HUSMAH ENGINEERING (PVT) Ltd Admin Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <AddNew />
      </body>
    </html>
  )
}
