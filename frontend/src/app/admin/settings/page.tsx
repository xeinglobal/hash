'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Settings = {
  trc20Wallet: string;
  minDeposit: number;
  minWithdrawal: number;
  referralBonus: number;
};

type CoinPrice = {
  _id: string;
  pricePerUnit: number;
  updatedBy: string;
  updatedAt: string;
  isActive: boolean;
};

export default function AdminSettings() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCoinPrice, setSavingCoinPrice] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    trc20Wallet: '',
    minDeposit: 10,
    minWithdrawal: 10,
    referralBonus: 15
  });
  const [coinPrice, setCoinPrice] = useState<CoinPrice | null>(null);
  const [newCoinPrice, setNewCoinPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [coinPriceError, setCoinPriceError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [coinPriceSuccess, setCoinPriceSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Admin değilse ana sayfaya yönlendir
    if (!isLoading && !user?.isAdmin) {
      router.push('/');
      return;
    }

    // Ayarları ve coin fiyatını getir
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Ayarları getir
        const settingsResponse = await fetch('/api/admin/settings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!settingsResponse.ok) {
          throw new Error('Ayarlar alınamadı');
        }

        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
        
        // Coin fiyatını getir
        const priceResponse = await fetch('/api/admin/coin-price', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!priceResponse.ok) {
          console.error('Coin fiyatı alınamadı');
        } else {
          const priceData = await priceResponse.json();
          setCoinPrice(priceData);
          setNewCoinPrice(priceData.pricePerUnit.toString());
        }
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user?.isAdmin) {
      fetchData();
    }
  }, [isLoading, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Sayısal alanlar için parseFloat uygula
    if (['minDeposit', 'minWithdrawal', 'referralBonus'].includes(name)) {
      setSettings({
        ...settings,
        [name]: parseFloat(value) || 0
      });
    } else {
      setSettings({
        ...settings,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Ayarlar güncellenirken bir hata oluştu');
      }

      setSuccess('Ayarlar başarıyla güncellendi');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ayarlar güncellenirken bir hata oluştu');
      }
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCoinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Sadece sayı ve nokta kabul et
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setNewCoinPrice(value);
    }
  };

  const handleCoinPriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSavingCoinPrice(true);
      setCoinPriceError(null);
      setCoinPriceSuccess(null);
      
      const priceValue = parseFloat(newCoinPrice);
      
      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error('Geçerli bir fiyat giriniz');
      }
      
      const response = await fetch('/api/admin/coin-price/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pricePerUnit: priceValue,
          notes: `Coin fiyatı ${priceValue} USDT olarak güncellendi.`
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Coin fiyatı güncellenirken bir hata oluştu');
      }

      const data = await response.json();
      setCoinPrice(data.currentPrice);
      setCoinPriceSuccess('Coin fiyatı başarıyla güncellendi');
    } catch (err) {
      if (err instanceof Error) {
        setCoinPriceError(err.message);
      } else {
        setCoinPriceError('Coin fiyatı güncellenirken bir hata oluştu');
      }
      console.error(err);
    } finally {
      setSavingCoinPrice(false);
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Sistem Ayarları
            </h1>
            <Link 
              href="/admin/dashboard"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Panele Dön
            </Link>
          </div>

          {/* Genel Ayarlar Bölümü */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Genel Ayarlar
              </h3>
            </div>
            
            {error && (
              <div className="p-4 bg-red-100 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-100 text-green-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label htmlFor="trc20Wallet" className="block text-sm font-medium text-gray-700">
                      TRC20 Cüzdan Adresi
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="trc20Wallet"
                        id="trc20Wallet"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={settings.trc20Wallet}
                        onChange={handleInputChange}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Para yatırma işlemleri için kullanılan TRC20 cüzdan adresi
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="minDeposit" className="block text-sm font-medium text-gray-700">
                      Minimum Para Yatırma
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="minDeposit"
                        id="minDeposit"
                        min="1"
                        step="0.01"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={settings.minDeposit}
                        onChange={handleInputChange}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      USDT cinsinden
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="minWithdrawal" className="block text-sm font-medium text-gray-700">
                      Minimum Para Çekme
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="minWithdrawal"
                        id="minWithdrawal"
                        min="1"
                        step="0.01"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={settings.minWithdrawal}
                        onChange={handleInputChange}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      USDT cinsinden
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="referralBonus" className="block text-sm font-medium text-gray-700">
                      Referans Bonusu
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="referralBonus"
                        id="referralBonus"
                        min="0"
                        max="100"
                        step="0.01"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={settings.referralBonus}
                        onChange={handleInputChange}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Yüzde (%) olarak
                    </p>
                  </div>

                  <div className="sm:col-span-6">
                    <div className="relative border border-gray-300 rounded-md px-3 py-2 shadow-sm">
                      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-3">
                        <p className="mb-2 text-sm text-gray-500">
                          Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
                        </p>
                        <button
                          type="submit"
                          disabled={saving}
                          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                            saving ? 'bg-primary-300' : 'bg-primary-600 hover:bg-primary-700'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                        >
                          {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Coin Fiyatı Bölümü */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Coin Fiyatı Ayarları
              </h3>
            </div>
            
            {coinPriceError && (
              <div className="p-4 bg-red-100 text-red-700">
                {coinPriceError}
              </div>
            )}

            {coinPriceSuccess && (
              <div className="p-4 bg-green-100 text-green-700">
                {coinPriceSuccess}
              </div>
            )}

            <form onSubmit={handleCoinPriceSubmit}>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="coinPrice" className="block text-sm font-medium text-gray-700">
                      Mevcut Coin Fiyatı (USDT)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="coinPrice"
                        id="coinPrice"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={newCoinPrice}
                        onChange={handleCoinPriceChange}
                        placeholder="0.00"
                      />
                    </div>
                    {coinPrice && (
                      <p className="mt-2 text-sm text-gray-500">
                        Güncel fiyat: {coinPrice.pricePerUnit} USDT <br />
                        Son güncelleme: {new Date(coinPrice.updatedAt).toLocaleString('tr-TR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={savingCoinPrice}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {savingCoinPrice ? 'Güncelleniyor...' : 'Coin Fiyatını Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 