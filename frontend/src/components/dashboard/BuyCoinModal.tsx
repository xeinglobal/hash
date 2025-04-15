import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getCurrentCoinPrice, buyCoin } from '@/services/coinService';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

interface BuyCoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type FormValues = {
  amount: number;
};

const BuyCoinModal: React.FC<BuyCoinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, refreshUserData } = useAuth();
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>();
  const watchAmount = watch('amount', 0);

  useEffect(() => {
    if (isOpen) {
      setError('');
      reset();
      fetchCurrentPrice();
    }
  }, [isOpen, reset]);

  // Calculate coin amount when amount changes
  useEffect(() => {
    if (currentPrice && watchAmount) {
      setCoinAmount(parseFloat((watchAmount / currentPrice).toFixed(4)));
    } else {
      setCoinAmount(0);
    }
  }, [watchAmount, currentPrice]);

  const fetchCurrentPrice = async () => {
    try {
      const priceData = await getCurrentCoinPrice();
      setCurrentPrice(priceData.pricePerUnit);
    } catch (err) {
      setError('Could not get current coin price. Please try again later.');
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Initiating coin purchase, amount:', data.amount);
      const response = await buyCoin(data.amount);
      console.log('Coin purchase response:', response);
      
      toast.success('Coin purchased successfully!', {
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
      console.error('Coin purchase error:', err);
      const errorResponse = err.response?.data;
      const errorMessage = errorResponse?.message || 'Coin purchase failed.';
      
      toast.error(`Coin purchase failed: ${errorMessage}`, {
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
          <h2 className="text-xl font-semibold text-white">Buy Coin</h2>
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

        <div className="mb-4 p-3 bg-blue-900/30 rounded-md">
          <div className="flex justify-between text-sm text-blue-300">
            <span>Current Coin Price:</span>
            <span className="font-semibold">{currentPrice.toFixed(3)} $</span>
          </div>
          <div className="flex justify-between text-sm text-blue-300 mt-1">
            <span>Current Balance:</span>
            <span className="font-semibold">{user?.balance.toFixed(2)} $</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
              Amount to Pay ($) <span className="text-red-400">*</span>
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min={0.01}
              max={user?.balance || 0}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E.g. 100"
              {...register('amount', {
                required: 'Amount is required',
                min: {
                  value: 0.01,
                  message: 'Minimum payment is 0.01 $'
                },
                max: {
                  value: user?.balance || 0,
                  message: 'You cannot pay more than your balance'
                },
                valueAsNumber: true
              })}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-400">{errors.amount.message}</p>
            )}
          </div>

          <div className="mb-4 p-3 bg-green-900/30 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-300">Coins to Receive:</span>
              <span className="text-lg font-bold text-green-300">{coinAmount}</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 mb-4">
            <p><strong>Note:</strong> Purchased coins will be added to your active coin account.</p>
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
              disabled={loading || !currentPrice || watchAmount <= 0 || watchAmount > (user?.balance || 0)}
            >
              {loading ? 'Processing...' : 'Buy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyCoinModal; 