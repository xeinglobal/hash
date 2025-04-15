import React, { useState, useEffect } from 'react';
import UserService from '@/services/userService';

type Transaction = {
  _id: string;
  type: 'deposit' | 'withdrawal' | 'stake' | 'buy_coin' | 'sell_coin';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
};

type TransactionType = 'all' | 'deposit' | 'withdrawal' | 'stake' | 'buy_coin' | 'sell_coin';

const TransactionHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TransactionType>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions(activeTab);
  }, [activeTab]);

  const fetchTransactions = async (type: TransactionType) => {
    setLoading(true);
    setError(null);
    
    try {
      let data: Transaction[];
      
      if (type === 'all') {
        const response = await UserService.getTransactionHistory();
        data = response;
      } else {
        const response = await UserService.getTransactionHistoryByType(type);
        data = response;
      }
      
      setTransactions(data);
    } catch (err: any) {
      console.error('Failed to get transaction history:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError('An error occurred while loading transaction history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: 'deposit' | 'withdrawal' | 'stake' | 'buy_coin' | 'sell_coin'): string => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'stake':
        return 'Stake';
      case 'buy_coin':
        return 'Buy Coin';
      case 'sell_coin':
        return 'Sell Coin';
      default:
        return type;
    }
  };

  const getAmountWithUnit = (amount: number, type: 'deposit' | 'withdrawal' | 'stake' | 'buy_coin' | 'sell_coin'): string => {
    switch (type) {
      case 'deposit':
      case 'withdrawal':
        return `${amount.toFixed(2)} $`;
      case 'stake':
        return `${amount.toFixed(2)} Coin`;
      case 'buy_coin':
        return `${amount.toFixed(2)} $`;
      case 'sell_coin':
        return `${amount.toFixed(2)} Coin`;
      default:
        return `${amount.toFixed(2)}`;
    }
  };

  const getStatusLabel = (status: 'pending' | 'approved' | 'rejected'): string => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getStatusColor = (status: 'pending' | 'approved' | 'rejected'): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-md rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-200  mb-4">Transaction History</h2>
      
      {/* Filter Tabs - Better arrangement for mobile */}
      <div className="mb-6 border-b border-gray-200">
        {/* Container for horizontal scrolling */}
        <div className="overflow-x-auto pb-1 hide-scrollbar">
          <div className="flex space-x-1 md:space-x-2 min-w-max">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium border-b-2 transition-colors shrink-0 ${
                activeTab === 'all'
                  ? 'border-white-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('deposit')}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium border-b-2 transition-colors shrink-0 ${
                activeTab === 'deposit'
                  ? 'border-white-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-200'
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setActiveTab('withdrawal')}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium border-b-2 transition-colors shrink-0 ${
                activeTab === 'withdrawal'
                  ? 'border-white-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-200'
              }`}
            >
              Withdrawal
            </button>
            <button
              onClick={() => setActiveTab('stake')}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium border-b-2 transition-colors shrink-0 ${
                activeTab === 'stake'
                  ? 'border-white-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-200'
              }`}
            >
              Stake
            </button>
            <button
              onClick={() => setActiveTab('buy_coin')}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium border-b-2 transition-colors shrink-0 ${
                activeTab === 'buy_coin'
                  ? 'border-white-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-200'
              }`}
            >
              Buy Coin
            </button>
            <button
              onClick={() => setActiveTab('sell_coin')}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium border-b-2 transition-colors shrink-0 ${
                activeTab === 'sell_coin'
                  ? 'border-white-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-200'
              }`}
            >
              Sell Coin
            </button>
          </div>
        </div>
      </div>
      
      {/* CSS for hiding scrollbar but allowing scroll */}
      <style jsx>{`
        .hide-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Transaction Table - Improvements for responsive design */}
      {!loading && !error && (
        <>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto -mx-6 sm:-mx-6 px-0 sm:px-6">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/70">
                  <tr>
                    <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900/50 backdrop-blur-sm divide-y divide-gray-700">
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString('en-US')}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs text-gray-300">
                        {getTypeLabel(tx.type)}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs text-gray-300">
                        {getAmountWithUnit(tx.amount, tx.type)}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(tx.status)}`}>
                          {getStatusLabel(tx.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">
              {activeTab === 'all'
                ? 'You don\'t have any transaction records yet.'
                : `You don't have any ${getTypeLabel(activeTab as 'deposit' | 'withdrawal' | 'stake' | 'buy_coin' | 'sell_coin')} transaction records yet.`}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionHistory; 