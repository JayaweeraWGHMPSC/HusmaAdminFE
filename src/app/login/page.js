'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from '../../components/Login';
import { SessionManager } from '../../utils/sessionManager';

export default function LoginPage() {
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    if (SessionManager.isSessionValid()) {
      // User still has valid session, redirect to dashboard
      router.push('/project');
    }
  }, [router]);

  const handleLoginSuccess = (user) => {
    console.log('Login successful:', user);
    // Router push is handled in the Login component
  };

  return <Login onLoginSuccess={handleLoginSuccess} />;
}
