import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getSettings } from '@/services/coinService';
import UserService from '@/services/userService';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type FormValues = {
  amount: number;
  walletAddress: string;
};

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [settings, setSettings] = useState<{ minWithdrawal: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, refreshUserData } = useAuth();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    if (isOpen) {
      setError('');
      reset();
      fetchSettings();
      if (user?.trcWallet) {
        setValue('walletAddress', user.trcWallet);
      }
    }
  }, [isOpen, reset, user, setValue]);

  const fetchSettings = async () => {
    try {
      const settingsData = await getSettings();
      setSettings(settingsData);
    } catch (err) {
      setError('Settings could not be retrieved. Please try again later.');
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Initiating withdrawal process, amount:', data.amount, 'wallet:', data.walletAddress);
      const response = await UserService.withdrawMoney(data.amount, data.walletAddress);
      console.log('Withdrawal response:', response);
      reset();
      await refreshUserData();
      
      // Show success notification
      toast.success('Your withdrawal request has been successfully received. It will be processed within 24-48 hours.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      const errorResponse = err.response?.data;
      const errorMessage = errorResponse?.message || 'Withdrawal operation failed.';
      console.error('Error message:', errorMessage, 'Error details:', errorResponse);
      
      // Show error notification
      toast.error(`Withdrawal operation failed: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      setError(`Withdrawal operation failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Withdrawal</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-800 transition"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-200" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/50 text-red-300 p-3 rounded-md text-sm border border-red-800">
            {error}
          </div>
        )}

        {settings && user ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6 p-4 bg-gray-800/50 rounded-md border border-gray-700">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Current Balance:</span>
                <span className="text-sm font-semibold text-white">{user.balance.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Minimum Withdrawal:</span>
                <span className="text-sm font-semibold text-teal-400">{settings.minWithdrawal} $</span>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-300 mb-1">
                TRC20 Wallet Address <span className="text-red-400">*</span>
              </label>
              <input
                id="walletAddress"
                type="text"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-white"
                placeholder="E.g. T..."
                {...register('walletAddress', {
                  required: 'Wallet address is required',
                  pattern: {
                    value: /^T[a-zA-Z0-9]{33}$/,
                    message: 'Enter a valid TRC20 wallet address (34 characters starting with T)'
                  }
                })}
              />
              {errors.walletAddress && (
                <p className="mt-1 text-sm text-red-400">{errors.walletAddress.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                Withdrawal Amount <span className="text-red-400">*</span>
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min={settings.minWithdrawal}
                max={user?.balance || 0}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-white"
                placeholder="E.g. 100"
                {...register('amount', {
                  required: 'Amount is required',
                  min: {
                    value: settings.minWithdrawal,
                    message: `You can withdraw minimum ${settings.minWithdrawal} TRC20`
                  },
                  max: {
                    value: user?.balance || 0,
                    message: 'You cannot withdraw more than your balance'
                  },
                  valueAsNumber: true
                })}
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-400">{errors.amount.message}</p>
              )}
            </div>

            <div className="text-xs text-gray-400 mb-4">
              <p><strong>Note:</strong> Withdrawal operations are manually approved. Your transaction will be completed within 24-48 hours.</p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 mr-2 hover:bg-gray-800 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-md hover:from-purple-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-400">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalModal; 