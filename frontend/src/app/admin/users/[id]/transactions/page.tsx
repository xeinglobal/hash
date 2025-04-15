'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

type Transaction = {
  _id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'staking' | 'referral' | 'transfer' | 'buy_coin' | 'sell_coin' | 'other';
  amount: number;
  status: 'pending' | 'completed' | 'rejected' | 'failed' | 'active' | 'inactive';
  description?: string;
  txHash?: string;
  createdAt: string;
  stakeDetails?: {
    packageName: string;
    dailyProfit: number;
    startDate: string;
    endDate: string;
    isCompleted: boolean;
  };
  referralDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    packageSize: number;
    stakeStatus: {
      packageName: string;
      dailyProfit: number;
      startDate: string;
      endDate: string;
    } | null;
  };
};

type User = {
  _id: string;
  username: string;
  email: string;
};

export default function UserTransactions() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'staking' | 'referral' | 'transfer' | 'buy_coin' | 'sell_coin' | 'other'>('all');

  useEffect(() => {
    // Admin değilse ana sayfaya yönlendir
    if (!isLoading && !user?.isAdmin) {
      router.push('/');
      return;
    }

    // İşlem geçmişini getir
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users/${userId}/transactions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('İşlem geçmişi alınamadı');
        }

        const data = await response.json();
        setTransactions(data.transactions || []);
        setUserInfo(data.user || null);
      } catch (err) {
        setError('İşlem geçmişi yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user?.isAdmin && userId) {
      fetchTransactions();
    }
  }, [isLoading, user, router, userId]);

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

  // İşlemleri filtrele
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  // Sayfalama için işlemleri al
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // İşlem tipi için etiket rengi
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return { label: 'Para Yatırma', color: 'bg-green-100 text-green-800' };
      case 'withdrawal':
        return { label: 'Para Çekme', color: 'bg-red-100 text-red-800' };
      case 'staking':
        return { label: 'Stake', color: 'bg-blue-100 text-blue-800' };
      case 'referral':
        return { label: 'Referans', color: 'bg-purple-100 text-purple-800' };
      case 'transfer':
        return { label: 'Transfer', color: 'bg-indigo-100 text-indigo-800' };
      case 'buy_coin':
        return { label: 'Coin Satın Alma', color: 'bg-yellow-100 text-yellow-800' };
      case 'sell_coin':
        return { label: 'Coin Bozdurma', color: 'bg-orange-100 text-orange-800' };
      default:
        return { label: 'Diğer', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // İşlem durumu için etiket rengi
  const getStatusLabel = (status: string, type: string) => {
    // Coin işlemleri her zaman tamamlandı olarak gösterilecek
    if (type === 'buy_coin' || type === 'sell_coin') {
      return { label: 'Tamamlandı', color: 'bg-green-100 text-green-800' };
    }

    // Referans işlemleri için özel durum
    if (type === 'referral') {
      return status === 'active' 
        ? { label: 'Aktif', color: 'bg-green-100 text-green-800' }
        : { label: 'Passif', color: 'bg-gray-100 text-gray-800' };
    }
    
    switch (status) {
      case 'completed':
        return { label: 'Tamamlandı', color: 'bg-green-100 text-green-800' };
      case 'pending':
        return { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' };
      case 'approved':
        return { label: 'Onaylandı', color: 'bg-green-100 text-green-800' };
      case 'rejected':
        return { label: 'Reddedildi', color: 'bg-red-100 text-red-800' };
      case 'failed':
        return { label: 'Başarısız', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' };
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Kullanıcı İşlem Geçmişi
              </h1>
              {userInfo && (
                <p className="mt-2 text-lg text-gray-500">
                  {userInfo.username} ({userInfo.email})
                </p>
              )}
            </div>
            <div className="space-x-2">
              <Link 
                href={`/admin/users/${userId}`}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Kullanıcı Detaylarına Dön
              </Link>
              <Link 
                href="/admin/users"
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Kullanıcılar Listesine Dön
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filtrele:</span>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'all' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setFilter('deposit')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'deposit' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                Para Yatırma
              </button>
              <button
                onClick={() => setFilter('withdrawal')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'withdrawal' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                Para Çekme
              </button>
              <button
                onClick={() => setFilter('staking')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'staking' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                Stake
              </button>
              <button
                onClick={() => setFilter('referral')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'referral' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                }`}
              >
                Referans
              </button>
              <button
                onClick={() => setFilter('buy_coin')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'buy_coin' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                Coin Satın Alma
              </button>
              <button
                onClick={() => setFilter('sell_coin')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'sell_coin' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                }`}
              >
                Coin Bozdurma
              </button>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlem ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlem Tipi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Miktar
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Açıklama
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((transaction) => (
                      <tr key={transaction._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {transaction._id.substring(0, 8)}...
                          </div>
                          {transaction.txHash && (
                            <div className="text-xs text-gray-500">
                              Tx: {transaction.txHash.substring(0, 8)}...
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString('tr-TR')}
                          <div className="text-xs">
                            {new Date(transaction.createdAt).toLocaleTimeString('tr-TR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getTypeLabel(transaction.type).color
                          }`}>
                            {getTypeLabel(transaction.type).label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(2)} USDT
                          </span>
                          {transaction.stakeDetails && (
                            <div className="text-xs text-gray-500 mt-1">
                              Günlük Kazanç: {transaction.stakeDetails.dailyProfit.toFixed(2)} USDT
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getStatusLabel(transaction.status, transaction.type).color
                          }`}>
                            {getStatusLabel(transaction.status, transaction.type).label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.description || '-'}
                          {transaction.stakeDetails && (
                            <div className="text-xs mt-1">
                              Paket: {transaction.stakeDetails.packageName}
                              <br />
                              Başlangıç: {new Date(transaction.stakeDetails.startDate).toLocaleDateString('tr-TR')}
                              <br />
                              Bitiş: {new Date(transaction.stakeDetails.endDate).toLocaleDateString('tr-TR')}
                            </div>
                          )}
                          {transaction.referralDetails && (
                            <div className="text-xs mt-1">
                              Referans: {transaction.referralDetails.firstName} {transaction.referralDetails.lastName}
                              <br />
                              Email: {transaction.referralDetails.email}
                              <br />
                              Paket: {transaction.referralDetails.packageSize} USDT
                              {transaction.referralDetails.stakeStatus && (
                                <>
                                  <br />
                                  Stake Paketi: {transaction.referralDetails.stakeStatus.packageName}
                                  <br />
                                  Günlük Kazanç: {transaction.referralDetails.stakeStatus.dailyProfit.toFixed(2)} USDT
                                  <br />
                                  Başlangıç: {new Date(transaction.referralDetails.stakeStatus.startDate).toLocaleDateString('tr-TR')}
                                  <br />
                                  Bitiş: {new Date(transaction.referralDetails.stakeStatus.endDate).toLocaleDateString('tr-TR')}
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        {filter !== 'all' 
                          ? `${getTypeLabel(filter).label} tipi işlem bulunamadı`
                          : 'İşlem bulunamadı'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Toplam <span className="font-medium">{filteredTransactions.length}</span> işlemden{' '}
                      <span className="font-medium">{indexOfFirstItem + 1}</span>-
                      <span className="font-medium">
                        {indexOfLastItem > filteredTransactions.length ? filteredTransactions.length : indexOfLastItem}
                      </span>{' '}
                      arası gösteriliyor
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Önceki</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === index + 1
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Sonraki</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}