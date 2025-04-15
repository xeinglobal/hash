'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserStake } from '@/types';
import StakeService from '@/services/stakeService';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function MyStakes() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeStakes, setActiveStakes] = useState<UserStake[]>([]);
  const [completedStakes, setCompletedStakes] = useState<UserStake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStake, setSelectedStake] = useState<UserStake | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Redirect to login page if user is not logged in
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchStakes = async () => {
      try {
        setIsLoading(true);
        const userStakes = await StakeService.getUserStakes();
        
        // Separate active and completed stakes
        const active = userStakes.filter(stake => !stake.isCompleted);
        const completed = userStakes.filter(stake => stake.isCompleted);
        
        setActiveStakes(active);
        setCompletedStakes(completed);
        setError(null);
      } catch (err) {
        console.error('Error loading stake information:', err);
        setError('There was a problem loading stake information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStakes();
  }, [user, router]);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  };

  const calculateRemainingDays = (endDate: Date | string) => {
    const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const now = new Date();
    const diffTime = endDateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateProgress = (startDate: Date | string, endDate: Date | string) => {
    const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const now = new Date();
    
    const totalDuration = endDateObj.getTime() - startDateObj.getTime();
    const elapsed = now.getTime() - startDateObj.getTime();
    
    if (elapsed <= 0) return 0;
    if (elapsed >= totalDuration) return 100;
    
    return Math.round((elapsed / totalDuration) * 100);
  };

  const handleStakeClick = (stake: UserStake) => {
    setSelectedStake(stake);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStake(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              <span className="block">Loading Your Stakes</span>
            </h1>
            <div className="mt-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              <span className="block">Error</span>
            </h1>
            <p className="mt-6 text-xl text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-8 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            <span className="block">My Stakes</span>
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            Track your active and past staking operations
          </p>
        </div>

        {/* Summary Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-primary-400 mb-2">Total Staked</h3>
            <p className="text-3xl font-bold text-white">
              {[...activeStakes, ...completedStakes].reduce((total, stake) => total + Number(stake.priceInCoins), 0).toLocaleString()} Coin
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-primary-400 mb-2">Active Stakes</h3>
            <p className="text-3xl font-bold text-white">{activeStakes.length}</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-primary-400 mb-2">Total Staking Earnings</h3>
            <p className="text-3xl font-bold text-white">
              {user?.totalStakeEarnings?.toFixed(8) || '0.00000000'} Coin
            </p>
          </div>
        </div>

        {/* Active Stakes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Active Stakes</h2>
          
          {activeStakes.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700 shadow-md">
              <h3 className="text-xl font-medium text-gray-200 mb-2">You don't have any active stakes</h3>
              <p className="text-gray-400 mb-6">Start earning passive income by starting a new staking operation.</p>
              <button 
                onClick={() => router.push('/stake-packages')}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition duration-200 inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Explore Stake Packages
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeStakes.map((stake) => {
                const progress = calculateProgress(stake.startDate, stake.endDate);
                const remainingDays = calculateRemainingDays(stake.endDate);
                
                return (
                  <div 
                    key={stake._id}
                    onClick={() => handleStakeClick(stake)}
                    className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-700"></div>
                    <div className="px-6 py-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {typeof stake.stakePackage === 'object' ? stake.stakePackage.name : 'Stake Package'}
                          </h3>
                          <p className="text-primary-400 text-sm">Start: {formatDate(stake.startDate)}</p>
                        </div>
                        <div className="bg-primary-900/50 text-primary-400 px-3 py-1 rounded-full text-sm font-semibold">
                          {stake.duration} Days
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-primary-400 to-primary-600 h-2.5 rounded-full" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="bg-gray-700 rounded-lg p-3 text-center border border-gray-600">
                          <p className="text-xs text-gray-400">Remaining Time</p>
                          <p className="text-lg font-bold text-white">{remainingDays} Days</p>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3 text-center border border-gray-600">
                          <p className="text-xs text-gray-400">Daily Earnings</p>
                          <p className="text-lg font-bold text-primary-400">{Number(stake.dailyProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400">Total Investment</span>
                          <span className="font-semibold text-white">{Number(stake.priceInCoins).toLocaleString()} Coin</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Earnings</span>
                          <span className="font-semibold text-primary-400">{Number(stake.totalProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })} Coin</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 text-center">
                        <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Stakes */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Completed Stakes</h2>
          
          {completedStakes.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700 shadow-md">
              <h3 className="text-xl font-medium text-gray-200">You don't have any completed stakes</h3>
              <p className="text-gray-400">Your completed stake operations will be listed here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-gray-800 rounded-xl shadow-md border border-gray-700">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Package</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Investment</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Earnings</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Start</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">End</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {completedStakes.map((stake) => (
                    <tr key={stake._id} className="hover:bg-gray-700 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {typeof stake.stakePackage === 'object' ? stake.stakePackage.name : 'Stake Package'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {stake.duration} Days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {Number(stake.priceInCoins).toLocaleString()} Coin
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-400 font-semibold">
                        {Number(stake.totalProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })} Coin
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(stake.startDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(stake.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => handleStakeClick(stake)}
                          className="text-primary-400 hover:text-primary-300"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Stake Detail Modal */}
      {isModalOpen && selectedStake && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-white">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Stake Details</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    {typeof selectedStake.stakePackage === 'object' ? selectedStake.stakePackage.name : 'Stake Package'}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedStake.isCompleted 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-primary-900/50 text-primary-400'
                  }`}>
                    {selectedStake.isCompleted ? 'Completed' : 'Active'}
                  </div>
                </div>
                
                {!selectedStake.isCompleted && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{calculateProgress(selectedStake.startDate, selectedStake.endDate)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-primary-400 to-primary-600 h-2.5 rounded-full" 
                        style={{ width: `${calculateProgress(selectedStake.startDate, selectedStake.endDate)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Start Date</p>
                    <p className="text-white">{formatDate(selectedStake.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">End Date</p>
                    <p className="text-white">{formatDate(selectedStake.endDate)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Stake Duration</p>
                    <p className="text-white">{selectedStake.duration} Days</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Profit Rate</p>
                    <p className="text-white">%{selectedStake.profitRate}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Financial Details</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stake Amount:</span>
                    <span className="text-white font-semibold">{Number(selectedStake.priceInCoins).toLocaleString()} Coin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Daily Earnings:</span>
                    <span className="text-primary-400 font-semibold">{Number(selectedStake.dailyProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })} Coin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Earnings:</span>
                    <span className="text-primary-400 font-semibold">{Number(selectedStake.totalProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })} Coin</span>
                  </div>
                  
                  {!selectedStake.isCompleted && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Days Remaining:</span>
                      <span className="text-white font-semibold">{calculateRemainingDays(selectedStake.endDate)} Days</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-600 my-4"></div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Return:</span>
                    <span className="text-white font-bold">
                      {(Number(selectedStake.priceInCoins) + Number(selectedStake.totalProfit)).toLocaleString(undefined, { maximumFractionDigits: 2 })} Coin
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 