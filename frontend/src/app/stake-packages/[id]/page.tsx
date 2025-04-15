'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StakeService from '@/services/stakeService';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Image from 'next/image';

// Defining the StakePackage interface directly in this file
interface Duration {
  days: number;
  profitRate: number;
}

interface StakePackage {
  _id: string;
  name: string;
  priceInCoins: number;
  durations: Duration[];
}

export default function StakePackageDetail({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [stakePackage, setStakePackage] = useState<StakePackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showInsufficientBalanceError, setShowInsufficientBalanceError] = useState(false);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        setLoading(true);
        const data = await StakeService.getStakePackageById(params.id);
        setStakePackage(data);
        
        // Select the first duration as default
        if (data.durations && data.durations.length > 0) {
          setSelectedDuration(data.durations[0].days);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading package details:', err);
        setError('There was a problem loading package details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPackageDetails();
    }
  }, [params.id]);

  const handleStakeSubmit = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!stakePackage || selectedDuration === null) {
      setError('Please select a stake duration.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Find duration index
      const durationIndex = stakePackage.durations.findIndex((d: Duration) => d.days === selectedDuration);
      if (durationIndex === -1) {
        throw new Error('Invalid duration selection');
      }
      
      // Send stake start request to API
      await StakeService.startStake(
        stakePackage._id,
        durationIndex, // Now sending the index value
        stakePackage.priceInCoins
      );
      
      setSuccessMessage('Your stake has been successfully started!');
      
      // Wait 2 seconds after successful stake and redirect
      setTimeout(() => {
        router.push('/dashboard/my-stakes');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error starting stake:', err);
      // Enhanced error message
      if (err.response?.status === 401) {
        setError('Your session may have expired. Please log in again.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else if (err.response?.data?.message === 'Yetersiz coin bakiyesi') {
        setError(null); // Clear normal error message
        // Show custom insufficient balance error
        setShowInsufficientBalanceError(true);
      } else {
        setError(err.response?.data?.message || 'There was a problem starting the stake. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDurationProfit = (days: number) => {
    if (!stakePackage) return null;
    return stakePackage.durations.find((duration: Duration) => duration.days === days)?.profitRate || 0;
  };

  const calculateTotalProfit = () => {
    if (!stakePackage || selectedDuration === null) return 0;
    const profitRate = getDurationProfit(selectedDuration);
    if (profitRate === null) return 0;
    return (stakePackage.priceInCoins * profitRate) / 100;
  };

  const calculateDailyProfit = () => {
    if (!stakePackage || selectedDuration === null) return 0;
    const totalProfit = calculateTotalProfit();
    return totalProfit / selectedDuration;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-teal-400">
              <h2 className="text-base font-semibold tracking-wide uppercase">Stake Package</h2>
              <p className="mt-1 text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                Loading Details
              </p>
            </div>
            <div className="mt-12 flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error && !successMessage) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-teal-400">
              <h2 className="text-base font-semibold tracking-wide uppercase">A Problem Occurred</h2>
              <p className="mt-1 text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                Error
              </p>
            </div>
            <p className="mt-6 text-xl text-red-500">{error}</p>
            <div className="mt-8 flex justify-center gap-4">
              <button 
                onClick={() => router.back()}
                className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700"
              >
                Go Back
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-teal-600 to-purple-600 hover:from-purple-800 hover:to-purple-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!stakePackage) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-teal-400">
              <h2 className="text-base font-semibold tracking-wide uppercase">Not Found</h2>
              <p className="mt-1 text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                Package Not Found
              </p>
            </div>
            <p className="mt-6 text-xl text-gray-400">
              The stake package you requested could not be found or is no longer available.
            </p>
            <div className="mt-8">
              <button 
                onClick={() => router.push('/stake-packages')}
                className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-teal-600 to-purple-600 hover:from-purple-800 hover:to-purple-500"
              >
                Back to All Packages
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {successMessage && (
            <div className="mb-8 bg-green-900/50 border border-green-500 rounded-lg p-4 text-center backdrop-blur-md">
              <p className="text-green-400 font-semibold">{successMessage}</p>
              <p className="text-green-500 text-sm mt-2">Redirecting...</p>
              <div className="mt-3 flex justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-400"></div>
              </div>
            </div>
          )}
          
          {/* Insufficient Balance Error */}
          {showInsufficientBalanceError && (
            <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="h-20 w-20 rounded-full bg-red-900/50 flex items-center justify-center">
                      <svg className="h-10 w-10 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-center text-white mb-2">Insufficient Balance</h2>
                  <p className="text-center text-gray-400 mb-6">
                    You don't have sufficient coins to start this stake package. You can increase your coin balance by depositing funds.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button
                      onClick={() => setShowInsufficientBalanceError(false)}
                      className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => router.push('/dashboard?isDeposit=true')}
                      className="px-4 py-2 bg-gradient-to-r from-teal-600 to-purple-600 hover:from-purple-800 hover:to-purple-500 text-white rounded-lg focus:outline-none"
                    >
                      Deposit Funds
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center mb-8">
            <button 
              onClick={() => router.back()}
              className="text-teal-400 hover:text-teal-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Packages
            </button>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-800">
            <div className="h-2 bg-gradient-to-r from-teal-500 to-purple-500"></div>
            <div className="px-6 py-8 sm:p-10">
              <div className="flex flex-col sm:flex-row justify-between items-center pb-6 border-b border-gray-800 mb-6">
                <h1 className="text-2xl font-bold text-white">{stakePackage.name}</h1>
                <div className="bg-gray-800 text-teal-400 px-4 py-2 rounded-full font-semibold text-sm mt-4 sm:mt-0">
                  {stakePackage.priceInCoins.toLocaleString()} Coins
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-28 w-28 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg className="h-14 w-14 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <div className="mt-10 w-full">
                  <h3 className="text-lg font-semibold text-white mb-4">Stake Duration</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stakePackage.durations.map((duration: Duration) => (
                      <div
                        key={duration.days}
                        onClick={() => setSelectedDuration(duration.days)}
                        className={`
                          p-4 rounded-lg text-center cursor-pointer transition-all duration-200 border
                          ${selectedDuration === duration.days 
                            ? 'bg-gray-800 border-purple-500 shadow-sm transform scale-105' 
                            : 'bg-gray-900/30 border-gray-700 hover:border-teal-600 hover:bg-gray-800/70'}
                        `}
                      >
                        <div className="text-2xl font-bold text-white">{duration.days}</div>
                        <div className="text-sm text-gray-400">Days</div>
                        <div className="mt-2 text-teal-400 font-semibold">+{duration.profitRate}%</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-10 w-full bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Profit Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stake Amount:</span>
                      <span className="text-gray-200 font-semibold">{stakePackage.priceInCoins.toLocaleString()} Coins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stake Duration:</span>
                      <span className="text-gray-200 font-semibold">{selectedDuration} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Profit Rate:</span>
                      <span className="text-teal-400 font-semibold">%{getDurationProfit(selectedDuration || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Profit:</span>
                      <span className="text-teal-400 font-semibold">{calculateTotalProfit().toLocaleString(undefined, { maximumFractionDigits: 2 })} Coins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Daily Profit:</span>
                      <span className="text-teal-400 font-semibold">{calculateDailyProfit().toLocaleString(undefined, { maximumFractionDigits: 2 })} Coins</span>
                    </div>
                    <div className="border-t border-gray-700 my-4"></div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Return:</span>
                      <span className="text-white font-bold">{(stakePackage.priceInCoins + calculateTotalProfit()).toLocaleString(undefined, { maximumFractionDigits: 2 })} Coins</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 w-full">
                  {user ? (
                    <button
                      onClick={handleStakeSubmit}
                      disabled={isSubmitting || selectedDuration === null}
                      className={`
                        w-full py-4 rounded-lg font-bold text-white flex items-center justify-center gap-2
                        ${isSubmitting 
                          ? 'bg-gray-700 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-teal-600 to-purple-600 hover:from-purple-800 hover:to-purple-500 transition-all duration-300'}
                      `}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                          Start Staking
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full py-4 bg-gradient-to-r from-teal-600 to-purple-600 hover:from-purple-800 hover:to-purple-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                      </svg>
                      Login to Stake
                    </button>
                  )}
                  
                  {error && !successMessage && (
                    <div className="mt-4 bg-red-900/30 border border-red-500 rounded-lg p-3 text-center">
                      <p className="text-red-400">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-gray-900/50 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-800">
            <div className="px-6 py-8 sm:p-10">
              <h3 className="text-xl font-bold text-white mb-4">Staking Terms and Conditions</h3>
              <ul className="space-y-4 mt-6">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">After starting the stake, your coins will remain locked for the selected duration.</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Your daily profits will be automatically credited to your account.</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">At the end of the stake duration, your principal amount and all accumulated profits will be added to your active coin balance.</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Even if you log out of the system or your connection is lost during the staking process, your profits will continue to be calculated.</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Related Packages - Optional but fancy additional section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-white">Explore Other Packages</h2>
            <p className="mt-4 text-gray-400">
              You can explore all our packages to find the one that best suits your needs.
            </p>
            <div className="mt-6">
              <button 
                onClick={() => router.push('/stake-packages')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-teal-600 to-purple-600 hover:from-purple-800 hover:to-purple-500 transition-all duration-300"
              >
                Browse All Packages
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 