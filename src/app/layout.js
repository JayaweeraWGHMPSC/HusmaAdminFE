import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import AddNew from '@/components/Addnew'
import Login from '@/components/Login'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  title: 'Husmah Engineering Admin',
  description: 'HUSMAH ENGINEERING (PVT) Ltd',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <AddNew />
        <Login />
      </body>
    </html>
  )
}
