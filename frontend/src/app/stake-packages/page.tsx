'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StakePackage } from '@/types';
import StakeService from '@/services/stakeService';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Image from 'next/image';

export default function StakePackages() {
  const { user } = useAuth();
  const router = useRouter();
  const [packages, setPackages] = useState<StakePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const data = await StakeService.getAllStakePackages();
        setPackages(data);
        setError(null);
      } catch (err) {
        console.error('Error loading packages:', err);
        setError('There was a problem loading packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handlePackageClick = (id: string) => {
    router.push(`/stake-packages/${id}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-teal-400">
              <h2 className="text-base font-semibold tracking-wide uppercase">Stake Packages</h2>
              <p className="mt-1 text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                Loading Packages
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

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-teal-400">
              <h2 className="text-base font-semibold tracking-wide uppercase">A Problem Occurred</h2>
              <p className="mt-1 text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                Error
              </p>
            </div>
            <p className="mt-6 text-xl text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-8 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <div className="relative">
          <div className="absolute inset-0  opacity-90" />
          <div className="relative bg-gray-900/50 backdrop-blur-md max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 lg:mt-10 rounded-lg">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Stake Packages
            </h1>
            <p className="mt-6 text-xl text-gray-500 max-w-3xl">
              Earn passive income by staking your coins. Choose the package that suits you best and start earning immediately.
            </p>
          </div>
        </div>

        {/* Packages List */}
        <div className="bg-transparent py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {packages.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/50 backdrop-blur-md rounded-lg shadow-sm border border-gray-800">
                <svg className="mx-auto h-16 w-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-white">No packages available yet</h3>
                <p className="mt-2 text-gray-400">Please check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packages.map((pkg) => (
                  <div
                    key={pkg._id}
                    onClick={() => handlePackageClick(pkg._id)}
                    className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer border border-gray-800"
                  >
                    <div className="h-2 bg-gradient-to-r from-primary-500 to-purple-500"></div>
                    <div className="px-6 py-8 relative">
                      <div className="absolute top-4 right-6 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {pkg.name}
                      </div>
                      
                      <div className="flex justify-center my-8 mt-10">
                        <div className="h-24 w-24 rounded-full bg-gray-800 flex items-center justify-center">
                          <svg className="h-12 w-12 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      
                      <h2 className="text-3xl font-bold text-center text-white mb-2 mt-4">
                        {pkg.priceInCoins.toLocaleString()} Coins
                      </h2>
                      
                      <div className="mt-8 space-y-3">
                        {pkg.durations.map((duration: { days: number; profitRate: number }, index: number) => (
                          <div key={index} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                            <span className="text-gray-300 font-medium">{duration.days} Days</span>
                            <span className="text-teal-400 font-bold">+{duration.profitRate}%</span>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        className="mt-8 w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold rounded-lg hover:from-purple-900 hover:to-purple-500 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* How Staking Works */}
        <div className=" backdrop-blur-md py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-base text-teal-400 font-semibold tracking-wide uppercase">Staking Process</h2>
              <p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                How Does Staking Work?
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto leading-relaxed">
                Start earning passive income in three simple steps
              </p>
            </div>
            
            <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-white">1. Choose a Package</h3>
                <p className="mt-2 text-base text-gray-400">Select a staking package that fits your budget and goals.</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-white">2. Set the Duration</h3>
                <p className="mt-2 text-base text-gray-400">Longer durations provide higher returns.</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-white">3. Earn Profits</h3>
                <p className="mt-2 text-base text-gray-400">Track your earnings added to your account daily.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-900/20 backdrop-blur-md rounded-xl py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white">
              XEIN Platform Statistics
            </h2>
            <p className="mt-4 text-xl text-teal-100">
              A testament to the trust in our platform
            </p>
            
            <dl className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-6">
                <dt className="text-base font-normal text-teal-100">Total Users</dt>
                <dd className="mt-2 text-3xl font-extrabold text-white">10,000+</dd>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-6">
                <dt className="text-base font-normal text-teal-100">Total Staked</dt>
                <dd className="mt-2 text-3xl font-extrabold text-white">50M+ Coins</dd>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-6">
                <dt className="text-base font-normal text-teal-100">Profit Paid</dt>
                <dd className="mt-2 text-3xl font-extrabold text-white">5M+ Coins</dd>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-6">
                <dt className="text-base font-normal text-teal-100">Active Packages</dt>
                <dd className="mt-2 text-3xl font-extrabold text-white">3,500+</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-transparent py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Start Earning Now</span>
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Choose the most suitable staking package for you and start earning passive income.
            </p>
            <div className="mt-8 flex justify-center">
              {user ? (
                <button
                  onClick={() => router.push('/dashboard/my-stakes')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-primary-600 to-purple-600 hover:from-purple-900 hover:to-purple-500 transition-all duration-300"
                >
                  View My Stakes
                </button>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
                >
                  Login and Start
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 