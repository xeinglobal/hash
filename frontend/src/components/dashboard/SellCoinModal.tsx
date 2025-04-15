import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getCurrentCoinPrice, convertCoinToBalance, getConversionStatus } from '@/services/coinService';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

interface SellCoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type FormValues = {
  coinAmount: number;
};

const SellCoinModal: React.FC<SellCoinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [balanceAmount, setBalanceAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversionStatus, setConversionStatus] = useState<{ isActive: boolean; message: string }>({ 
    isActive: false, 
    message: '' 
  });
  const { user, refreshUserData } = useAuth();
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>();
  const watchCoinAmount = watch('coinAmount', 0);

  useEffect(() => {
    if (isOpen) {
      setError('');
      reset();
      fetchData();
    }
  }, [isOpen, reset]);

  // Calculate $ amount when coin amount changes
  useEffect(() => {
    if (currentPrice && watchCoinAmount) {
      setBalanceAmount(parseFloat((watchCoinAmount * currentPrice).toFixed(2)));
    } else {
      setBalanceAmount(0);
    }
  }, [watchCoinAmount, currentPrice]);

  const fetchData = async () => {
    try {
      const [priceData, statusData] = await Promise.all([
        getCurrentCoinPrice(),
        getConversionStatus()
      ]);
      
      setCurrentPrice(priceData.pricePerUnit);
      setConversionStatus(statusData);
    } catch (err) {
      setError('Could not retrieve data. Please try again later.');
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Initiating coin sell process, amount:', data.coinAmount);
      const response = await convertCoinToBalance(data.coinAmount);
      console.log('Coin sell response:', response);
      
      toast.success('Coins successfully converted to balance!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      reset();
      await refreshUserData();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Coin sell error:', err);
      const errorResponse = err.response?.data;
      const errorMessage = errorResponse?.message || 'Coin sell operation failed.';
      
      toast.error(`Coin sell failed: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 md:px-6">
      <div className="bg-gray-900 text-white rounded-lg shadow-xl w-full max-w-md p-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Sell Coin</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700 transition"
          >
            <XMarkIcon className="h-6 w-6 text-gray-300" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/30 text-red-300 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {!conversionStatus.isActive && (
          <div className="mb-4 bg-red-900/30 text-red-300 p-3 rounded-md">
            <p className="font-medium">Coin Selling is Currently Disabled</p>
            <p className="text-sm mt-1">{conversionStatus.message}</p>
          </div>
        )}

        <div className="mb-4 p-3 bg-blue-900/30 rounded-md">
          <div className="flex justify-between text-sm text-blue-300">
            <span>Current Coin Price:</span>
            <span className="font-semibold">{currentPrice.toFixed(3)} $</span>
          </div>
          <div className="flex justify-between text-sm text-blue-300 mt-1">
            <span>Your Active Coins:</span>
            <span className="font-semibold">{user?.activeCoin.toFixed(8)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label htmlFor="coinAmount" className="block text-sm font-medium text-gray-300 mb-1">
              Coin Amount to Sell <span className="text-red-400">*</span>
            </label>
            <input
              id="coinAmount"
              type="number"
              step="0.0001"
              min={0.0001}
              max={user?.activeCoin || 0}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E.g. 10"
              disabled={!conversionStatus.isActive}
              {...register('coinAmount', {
                required: 'Coin amount is required',
                min: {
                  value: 0.0001,
                  message: 'You can sell minimum 0.0001 coins'
                },
                max: {
                  value: user?.activeCoin || 0,
                  message: 'You cannot sell more than your active coins'
                },
                valueAsNumber: true
              })}
            />
            {errors.coinAmount && (
              <p className="mt-1 text-sm text-red-400">{errors.coinAmount.message}</p>
            )}
          </div>

          <div className="mb-4 p-3 bg-green-900/30 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-300">Amount in $ You Will Receive:</span>
              <span className="text-lg font-bold text-green-300">{balanceAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 mb-4">
            <p><strong>Note:</strong> You can only sell your active coins. Passive coins are staked coins and cannot be sold.</p>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 mr-2 hover:bg-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading || !currentPrice || !conversionStatus.isActive || watchCoinAmount <= 0 || watchCoinAmount > (user?.activeCoin || 0)}
            >
              {loading ? 'Processing...' : 'Sell'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellCoinModal; 