'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type DashboardStats = {
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalUsers: number;
  recentActivity: {
    deposits: number;
    withdrawals: number;
  };
  depositStats: {
    [key: string]: { amount: number; count: number };
  };
  withdrawalStats: {
    [key: string]: { amount: number; count: number };
  };
};

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Admin değilse ana sayfaya yönlendir
    if (!isLoading && !user?.isAdmin) {
      router.push('/');
      return;
    }

    // İstatistikleri getir
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('İstatistikler alınamadı');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError('İstatistikler yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user?.isAdmin) {
      fetchDashboardStats();
    }
  }, [isLoading, user, router]);

  // Yükleme durumunu kontrol et
  if (isLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Admin Kontrol Paneli
            </h1>
            <p className="mt-3 text-lg text-gray-500">
              Platform istatistikleri ve operasyonlar
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* İstatistik Kartları */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Toplam Kullanıcı
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {stats?.totalUsers || 0}
                </dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Bekleyen Para Yatırma
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {stats?.pendingDeposits || 0}
                </dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Bekleyen Para Çekme
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {stats?.pendingWithdrawals || 0}
                </dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Son 24 Saat İşlemler
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {(stats?.recentActivity?.deposits || 0) + (stats?.recentActivity?.withdrawals || 0)}
                </dd>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Para Yatırma İstatistikleri</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Miktar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlem Sayısı
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats?.depositStats ? (
                      Object.entries(stats.depositStats).map(([status, data]) => (
                        <tr key={status}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {status}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {data.amount.toFixed(2)} USDT
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {data.count}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          Veri bulunamadı
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Para Çekme İstatistikleri</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Miktar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlem Sayısı
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats?.withdrawalStats ? (
                      Object.entries(stats.withdrawalStats).map(([status, data]) => (
                        <tr key={status}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {status}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {data.amount.toFixed(2)} USDT
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {data.count}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          Veri bulunamadı
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Hızlı İşlemler</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Sistem yönetim işlemlerine erişim</p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Kullanıcı Yönetimi</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <Link href="/admin/users" className="text-primary-600 hover:text-primary-900">
                        Kullanıcıları Görüntüle
                      </Link>
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Sistem Ayarları</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <Link href="/admin/settings" className="text-primary-600 hover:text-primary-900">
                        Ayarları Düzenle
                      </Link>
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Para İşlemleri</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <Link href="/admin/transactions" className="text-primary-600 hover:text-primary-900 mr-4">
                        Para Yatırma İşlemleri
                      </Link>
                      <Link href="/admin/withdrawals" className="text-primary-600 hover:text-primary-900">
                        Para Çekme İşlemleri
                      </Link>
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Stake İşlemleri</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <Link href="/admin/stake-packages" className="text-primary-600 hover:text-primary-900 mr-4">
                        Stake Paketleri Yönetimi
                      </Link>
                      <Link href="/admin/user-stakes" className="text-primary-600 hover:text-primary-900">
                        Kullanıcı Stake İşlemleri
                      </Link>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 