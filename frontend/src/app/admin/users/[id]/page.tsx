'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

type UserDetail = {
  _id: string;
  email: string;
  username: string;
  fullName: string;
  isAdmin: boolean;
  isVerified: boolean;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  trc20Address?: string;
};

export default function UserDetail() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Admin değilse ana sayfaya yönlendir
    if (!isLoading && !user?.isAdmin) {
      router.push('/');
      return;
    }

    // Kullanıcı detaylarını getir
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Kullanıcı bilgileri alınamadı');
        }

        const data = await response.json();
        setUserDetail(data);
      } catch (err) {
        setError('Kullanıcı bilgileri yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user?.isAdmin && userId) {
      fetchUserDetail();
    }
  }, [isLoading, user, router, userId]);

  // Kullanıcı doğrulama durumunu değiştir
  const toggleVerificationStatus = async () => {
    if (!userDetail) return;
    
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch(`/api/admin/users/${userId}/toggle-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'İşlem gerçekleştirilemedi');
      }

      const data = await response.json();
      
      // Kullanıcı bilgilerini güncelle
      setUserDetail({
        ...userDetail,
        isVerified: data.isVerified
      });
      
      setSuccess(`Kullanıcı ${data.isVerified ? 'doğrulandı' : 'doğrulanmamış olarak işaretlendi'}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('İşlem gerçekleştirilemedi');
      }
    } finally {
      setActionLoading(false);
    }
  };

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

  if (!userDetail) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <h1 className="text-xl font-medium text-gray-900 mb-4">Kullanıcı bulunamadı</h1>
              <Link 
                href="/admin/users"
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Kullanıcılar Listesine Dön
              </Link>
            </div>
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
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Kullanıcı Detayları
            </h1>
            <Link 
              href="/admin/users"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Kullanıcılar Listesine Dön
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                {userDetail.username}
                <span className={`ml-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  userDetail.isAdmin 
                    ? 'bg-purple-100 text-purple-800' 
                    : userDetail.isVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {userDetail.isAdmin ? 'Admin' : userDetail.isVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                </span>
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Kullanıcı kayıt tarihi: {new Date(userDetail.createdAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Ad Soyad
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userDetail.fullName || 'Belirtilmemiş'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userDetail.email}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Bakiye
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userDetail.balance?.toFixed(2) || '0.00'} USDT
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Toplam Para Yatırma
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userDetail.totalDeposits?.toFixed(2) || '0.00'} USDT
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Toplam Para Çekme
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userDetail.totalWithdrawals?.toFixed(2) || '0.00'} USDT
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    TRC20 Cüzdan Adresi
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userDetail.trc20Address || 'Belirtilmemiş'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Referans Kodu
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userDetail.referralCode}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Referans Eden
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userDetail.referredBy || 'Yok'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Kullanıcı ID
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userDetail._id}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <div className="flex justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  İşlemler
                </h3>
                <div className="space-x-3">
                  <button
                    onClick={toggleVerificationStatus}
                    disabled={actionLoading}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      userDetail.isVerified 
                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                  >
                    {actionLoading ? 'İşleniyor...' : userDetail.isVerified ? 'Doğrulamayı Kaldır' : 'Doğrula'}
                  </button>
                  
                  <Link 
                    href={`/admin/users/${userId}/transactions`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    İşlem Geçmişi
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 