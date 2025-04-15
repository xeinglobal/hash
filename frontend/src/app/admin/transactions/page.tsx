'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Deposit = {
  _id: string;
  userId: string;
  amount: number;
  txHash: string;
  status: 'pending' | 'approved' | 'rejected';
  userInfo?: {
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

export default function AdminTransactions() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');

  useEffect(() => {
    // Admin değilse ana sayfaya yönlendir
    if (!isLoading && !user?.isAdmin) {
      router.push('/');
      return;
    }

    if (!isLoading && user?.isAdmin) {
      fetchDeposits();
    }
  }, [isLoading, user, router]);

  // Para yatırma işlemlerini getir
  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/deposits', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Para yatırma işlemleri alınamadı');
      }

      const data = await response.json();
      console.log('Fetched deposits:', data);
      setDeposits(data);
    } catch (err) {
      setError('Para yatırma işlemleri yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Deposit işlemini onayla
  const approveDeposit = async (id: string) => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log(`Approving deposit with ID: ${id}`);
      const response = await fetch(`/api/admin/deposits/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json();
      console.log('Approve response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'İşlem onaylanırken bir hata oluştu');
      }
      
      setSuccess('Para yatırma işlemi başarıyla onaylandı');
      
      // İşlemler listesini yenile
      setTimeout(fetchDeposits, 500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('İşlem onaylanırken bir hata oluştu');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Deposit işlemini reddet
  const rejectDeposit = async (id: string) => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log(`Rejecting deposit with ID: ${id}`);
      const response = await fetch(`/api/admin/deposits/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json();
      console.log('Reject response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'İşlem reddedilirken bir hata oluştu');
      }
      
      setSuccess('Para yatırma işlemi reddedildi');
      
      // İşlemler listesini yenile
      setTimeout(fetchDeposits, 500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('İşlem reddedilirken bir hata oluştu');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // İşlemleri filtrele
  const filteredDeposits = deposits.filter(deposit => {
    if (filter === 'all') return true;
    
    // Filtreleme için backend değerlerini frontend değerlerine çevir
    if (filter === 'completed' && deposit.status === 'approved') return true; 
    if (filter === 'pending' && deposit.status === 'pending') return true;
    if (filter === 'rejected' && deposit.status === 'rejected') return true;
    
    return false;
  });

  // Durum bilgisini görüntülerken doğru değer dönüşümü yap
  const getStatusText = (status: string) => {
    switch(status) {
      case 'approved':
        return 'Tamamlandı';
      case 'pending':
        return 'Bekliyor';
      case 'rejected':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  // Sayfalama için işlemleri al
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDeposits.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Para Yatırma İşlemleri
            </h1>
            <Link 
              href="/admin/dashboard"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Panele Dön
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
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'pending' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                Bekleyen
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                Tamamlanan
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'rejected' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                Reddedilen
              </button>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlem Bilgisi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Miktar
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((deposit) => (
                      <tr key={deposit._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ID: {deposit._id.substring(0, 8)}...
                          </div>
                          <div className="text-sm text-gray-500">
                            Tx: {deposit.txHash && deposit.txHash.substring(0, 8)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {deposit.userInfo?.username || 'İsimsiz'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {deposit.userInfo?.email || 'E-posta yok'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {deposit.amount.toFixed(2)} USDT
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(deposit.status)}`}>
                            {getStatusText(deposit.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(deposit.createdAt).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {deposit.status === 'pending' && (
                            <>
                              <button
                                onClick={() => approveDeposit(deposit._id)}
                                disabled={actionLoading}
                                className="text-green-600 hover:text-green-900 mr-2"
                              >
                                Onayla
                              </button>
                              <button
                                onClick={() => rejectDeposit(deposit._id)}
                                disabled={actionLoading}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reddet
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        {filter !== 'all' 
                          ? `${filter === 'pending' ? 'Bekleyen' : filter === 'completed' ? 'Tamamlanan' : 'Reddedilen'} işlem bulunamadı`
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
                      Toplam <span className="font-medium">{filteredDeposits.length}</span> işlemden{' '}
                      <span className="font-medium">{indexOfFirstItem + 1}</span>-
                      <span className="font-medium">
                        {indexOfLastItem > filteredDeposits.length ? filteredDeposits.length : indexOfLastItem}
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