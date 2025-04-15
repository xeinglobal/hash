import api from './api';
import { StakePackage, UserStake } from '../types';

export const StakeService = {
  // Tüm stake paketlerini getir
  getAllStakePackages: async (): Promise<StakePackage[]> => {
    try {
      const response = await api.get('/stake-packages');
      return response.data;
    } catch (error) {
      console.error('Stake paketleri alınamadı:', error);
      throw error;
    }
  },

  // ID'ye göre stake paketi getir
  getStakePackageById: async (id: string): Promise<StakePackage> => {
    try {
      const response = await api.get(`/stake-packages/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Stake paketi (${id}) alınamadı:`, error);
      throw error;
    }
  },

  // Kullanıcının stake işlemlerini getir
  getUserStakes: async (): Promise<UserStake[]> => {
    try {
      const response = await api.get('/user-stakes');
      return response.data;
    } catch (error) {
      console.error('Kullanıcı stake işlemleri alınamadı:', error);
      throw error;
    }
  },

  // Aktif stake işlemlerini getir
  getActiveUserStakes: async (): Promise<UserStake[]> => {
    try {
      const response = await api.get('/user-stakes/active');
      return response.data;
    } catch (error) {
      console.error('Aktif stake işlemleri alınamadı:', error);
      throw error;
    }
  },

  // Yeni stake başlat
  startStake: async (
    stakePackageId: string, 
    duration: number,
    amount: number
  ): Promise<UserStake> => {
    try {
      const response = await api.post('/user-stakes', {
        stakePackageId,
        durationIndex: duration,
        amount
      });
      return response.data;
    } catch (error) {
      console.error('Stake başlatılamadı:', error);
      throw error;
    }
  },

  // Stake detayını getir
  getUserStakeDetails: async (stakeId: string): Promise<UserStake> => {
    try {
      const response = await api.get(`/user-stakes/${stakeId}`);
      return response.data;
    } catch (error) {
      console.error(`Stake detayı (${stakeId}) alınamadı:`, error);
      throw error;
    }
  },

  // Stake işlemlerini getir
  getStakeHistory: async (): Promise<UserStake[]> => {
    try {
      const response = await api.get('/user-stakes/history');
      return response.data;
    } catch (error) {
      console.error('Stake işlemleri alınamadı:', error);
      throw error;
    }
  },

  // Stake işlemini tamamla
  claimStake: async (stakeId: string): Promise<UserStake> => {
    try {
      const response = await api.post(`/user-stakes/${stakeId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Stake işlemi tamamlanamadı:', error);
      throw error;
    }
  },

  // Stake istatistiklerini getir
  getStakeStatistics: async (): Promise<any> => {
    try {
      const response = await api.get('/user-stakes/statistics');
      return response.data;
    } catch (error) {
      console.error('Stake istatistikleri alınamadı:', error);
      throw error;
    }
  }
};

export default StakeService; 