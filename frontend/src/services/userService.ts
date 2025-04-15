import api from './api';
import { User } from '../types';

// İşlem geçmişi fonksiyonu
export const getTransactionHistory = async (): Promise<any[]> => {
  try {
    const response = await api.get('/transactions/user');
    return response.data;
  } catch (error: any) {
    console.error('getTransactionHistory hatası:', error.message);
    console.error('Hata yanıtı:', error.response?.data);
    console.error('Hata durumu:', error.response?.status);
    throw error;
  }
};

// İşlem geçmişini tipine göre getir
export const getTransactionHistoryByType = async (type: 'deposit' | 'withdrawal' | 'stake' | 'buy_coin' | 'sell_coin'): Promise<any[]> => {
  try {
    const response = await api.get(`/transactions/user/${type}`);
    return response.data;
  } catch (error: any) {
    console.error(`getTransactionHistoryByType (${type}) hatası:`, error.message);
    console.error('Hata yanıtı:', error.response?.data);
    console.error('Hata durumu:', error.response?.status);
    throw error;
  }
};

// Para yatırma fonksiyonu
export const depositMoney = async (amount: number): Promise<any> => {
  try {
    const response = await api.post('/deposits/create', { amount });
    return response.data;
  } catch (error: any) {
    console.error('depositMoney hata:', error.message);
    console.error('Hata yanıtı:', error.response?.data);
    console.error('Hata durumu:', error.response?.status);
    throw error;
  }
};

// Para çekme fonksiyonu
export const withdrawMoney = async (amount: number, trcWallet: string): Promise<any> => {
  try {
    const response = await api.post('/withdrawals/create', { amount, trcWallet });
    return response.data;
  } catch (error: any) {
    console.error('withdrawMoney hata:', error.message);
    console.error('Hata yanıtı:', error.response?.data);
    console.error('Hata durumu:', error.response?.status);
    throw error;
  }
};

// Yatırma geçmişi
export const getDepositHistory = async (): Promise<any[]> => {
  try {
    const response = await api.get('/deposits/user');
    return response.data;
  } catch (error: any) {
    console.error('getDepositHistory hatası:', error.message);
    console.error('Hata yanıtı:', error.response?.data);
    console.error('Hata durumu:', error.response?.status);
    throw error;
  }
};

// Çekme geçmişi
export const getWithdrawalHistory = async (): Promise<any[]> => {
  try {
    const response = await api.get('/withdrawals/user');
    return response.data;
  } catch (error: any) {
    console.error('getWithdrawalHistory hatası:', error.message);
    console.error('Hata yanıtı:', error.response?.data);
    console.error('Hata durumu:', error.response?.status);
    throw error;
  }
};

// Kullanıcı profili
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error: any) {
    console.error('getUserProfile hatası:', error.message);
    console.error('Hata yanıtı:', error.response?.data);
    console.error('Hata durumu:', error.response?.status);
    throw error;
  }
};

// Kullanıcı profilini güncelle
export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await api.put('/users/profile', userData);
    return response.data;
  } catch (error: any) {
    console.error('updateUserProfile hatası:', error.message);
    console.error('Hata yanıtı:', error.response?.data);
    console.error('Hata durumu:', error.response?.status);
    throw error;
  }
};

// Kullanıcı bakiyesi
export const getUserBalance = async (): Promise<{ balance: number; activeCoin: number; passiveCoin: number }> => {
  try {
    const response = await api.get('/users/balance');
    return response.data;
  } catch (error: any) {
    console.error('getUserBalance hatası:', error.message);
    console.error('Hata yanıtı:', error.response?.data);
    console.error('Hata durumu:', error.response?.status);
    throw error;
  }
};

// Servis nesnesi - default export için
const UserService = {
  getTransactionHistory,
  getTransactionHistoryByType,
  depositMoney,
  withdrawMoney,
  getDepositHistory,
  getWithdrawalHistory,
  getUserProfile,
  updateUserProfile,
  getUserBalance,
  
  // Profil güncelleme - yeni eklenen
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put('/users/update-profile', userData);
      return response.data;
    } catch (error) {
      console.error('Profil güncellenirken hata oluştu:', error);
      throw error;
    }
  }
};

// Default export - tüm sınıfı dışa aktar
export default UserService; 