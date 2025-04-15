'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user?.isAdmin) {
        // Admin değilse ana sayfaya yönlendir
        router.push('/');
      } else {
        // Admin ise dashboard'a yönlendir
        router.push('/admin/dashboard');
      }
    }
  }, [isLoading, user, router]);

  // Yönlendirme yapılırken yükleme göster
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"></div>
      <p className="ml-3 text-gray-600">Yönlendiriliyor...</p>
    </div>
  );
} 