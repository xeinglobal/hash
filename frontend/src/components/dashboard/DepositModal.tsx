import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getSettings } from '@/services/coinService';
import UserService from '@/services/userService';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type FormValues = {
  amount: number;
};

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [settings, setSettings] = useState<{ trc20Wallet: string; minDeposit: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { refreshUserData } = useAuth();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    if (isOpen) {
      setError('');
      reset();
      fetchSettings();
    }
  }, [isOpen, reset]);

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
      console.log('Initiating deposit process, amount:', data.amount);
      const response = await UserService.depositMoney(data.amount);
      console.log('Deposit response:', response);
      reset();
      await refreshUserData();
      
      // Show success notification
      toast.success('Your deposit request has been successfully received. It will be processed within 24 hours.', {
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
      console.error('Deposit error:', err);
      const errorResponse = err.response?.data;
      const errorMessage = errorResponse?.message || 'Deposit operation failed.';
      console.error('Error message:', errorMessage, 'Error details:', errorResponse);
      
      // Show error notification
      toast.error(`Deposit operation failed: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      setError(`Deposit operation failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Deposit</h2>
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

        {settings ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6 p-4 bg-teal-900/30 rounded-md border border-teal-800/50">
              <h3 className="font-medium text-teal-300 mb-2">Deposit Instructions</h3>
              <p className="text-sm text-teal-200 mb-2">
                1. Transfer to this TRC20 wallet: 
              </p>
              <div className="bg-gray-800 p-3 rounded border border-gray-700 break-all font-mono text-sm mb-2 text-gray-300">
                {settings.trc20Wallet}
              </div>
              <p className="text-sm text-teal-200">
                2. After completing your transfer, fill out the form below.
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                Deposit Amount <span className="text-red-400">*</span>
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min={settings.minDeposit}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-white"
                placeholder="E.g. 100"
                {...register('amount', {
                  required: 'Amount is required',
                  min: {
                    value: settings.minDeposit,
                    message: `You can deposit minimum ${settings.minDeposit} TRC20`
                  },
                  valueAsNumber: true
                })}
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-400">{errors.amount.message}</p>
              )}
            </div>

            <div className="text-xs text-gray-400 mb-4">
              <p><strong>Note:</strong> Deposit operations are manually approved. Your transaction will be approved within 24 hours.</p>
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
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-md hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Deposit'}
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

export default DepositModal; 