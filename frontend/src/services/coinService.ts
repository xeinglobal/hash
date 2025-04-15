import api from './api';

export const getCurrentCoinPrice = async (): Promise<{pricePerUnit: number}> => {
  try {
    const response = await api.get('/coin-prices/current');
    return response.data;
  } catch (error: any) {
    console.error('Error while getting current coin price:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const getCoinPriceHistory = async (limit = 30): Promise<any[]> => {
  try {
    const response = await api.get(`/coin-prices/history?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error('Error while getting coin price history:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const buyCoin = async (amount: number): Promise<any> => {
  try {
    const response = await api.post('/coins/buy', { amount });
    return response.data;
  } catch (error: any) {
    console.error('Error while buying coin:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const convertCoinToBalance = async (coinAmount: number): Promise<any> => {
  try {
    const response = await api.post('/coins/convert', { coinAmount });
    return response.data;
  } catch (error: any) {
    console.error('Error during coin conversion:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const getConversionStatus = async (): Promise<{isActive: boolean, message: string}> => {
  try {
    const response = await api.get('/coins/conversion-status');
    return response.data;
  } catch (error: any) {
    console.error('Error while getting conversion status:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const getSettings = async (): Promise<{trc20Wallet: string, minDeposit: number, minWithdrawal: number}> => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error: any) {
    console.error('Error while getting settings:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
}; 