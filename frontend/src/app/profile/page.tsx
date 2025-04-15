'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { User } from '@/types';
import UserService from '@/services/userService';

export default function ProfilePage() {
  const { user, refreshUserData, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    trcWallet: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showReferrals, setShowReferrals] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Function to calculate remaining days
  const calculateRemainingDays = (deadlineDate: string | Date) => {
    const deadline = new Date(deadlineDate);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Function to determine package name based on package size
  const getPackageName = (packageSize: number): string => {
    if (packageSize <= 0) return "No Package";
    if (packageSize <= 500) return "Hash Bronze";
    if (packageSize <= 1000) return "Hash Silver";
    if (packageSize <= 2500) return "Hash Gold";
    if (packageSize <= 5000) return "Hash Platinum";
    return "Hash Diamond";
  };

  useEffect(() => {
    const initializeData = async () => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
        return;
      }

      if (isInitialLoad && isAuthenticated) {
        await refreshUserData();
        setIsInitialLoad(false);
      }
    };

    initializeData();
  }, [isLoading, isAuthenticated, isInitialLoad]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        trcWallet: user.trcWallet || ''
      });
    }
  }, [user]);

  // Update form data
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Profile update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      // Send API request
      await UserService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        trcWallet: formData.trcWallet
      });
      
      setSuccess('Your profile information has been successfully updated.');
      await refreshUserData(); // Refresh user data
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while updating your profile.');
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center">
              <h2 className="text-base font-semibold tracking-wide uppercase text-primary-400">Profile</h2>
              <p className="mt-1 text-4xl font-extrabold text-white sm:tracking-tight">
                Loading
              </p>
              <div className="mt-5 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center">
              <h2 className="text-base font-semibold tracking-wide uppercase text-primary-400">Error</h2>
              <p className="mt-1 text-4xl font-extrabold text-white sm:tracking-tight">
                User information not found
              </p>
              <div className="mt-5">
                <button
                  onClick={() => router.push('/login')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Log In
                </button>
              </div>
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
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
              My Profile
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-300">
              View your account information and earnings
            </p>
          </div>

          {/* Main section - two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - User Information */}
            <div className="lg:col-span-2">
              {error && (
                <div className="bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-900/30 border-l-4 border-green-500 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-300">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Information Card */}
              <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-white">Profile Information</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-400">Your personal information and account details</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                
                {isEditing ? (
                  <div className="border-t border-gray-700">
                    <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                            First Name
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="firstName"
                              id="firstName"
                              autoComplete="given-name"
                              value={formData.firstName}
                              onChange={handleChange}
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm bg-gray-700 border-gray-600 text-white rounded-md"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                            Last Name
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="lastName"
                              id="lastName"
                              autoComplete="family-name"
                              value={formData.lastName}
                              onChange={handleChange}
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm bg-gray-700 border-gray-600 text-white rounded-md"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                            Email
                          </label>
                          <div className="mt-1">
                            <input
                              type="email"
                              name="email"
                              id="email"
                              autoComplete="email"
                              value={formData.email}
                              onChange={handleChange}
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm bg-gray-700 border-gray-600 text-white rounded-md opacity-70"
                              disabled
                            />
                            <p className="mt-1 text-xs text-gray-400">Email address cannot be changed.</p>
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label htmlFor="trcWallet" className="block text-sm font-medium text-gray-300">
                            TRC Wallet Address
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="trcWallet"
                              id="trcWallet"
                              value={formData.trcWallet}
                              onChange={handleChange}
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm bg-gray-700 border-gray-600 text-white rounded-md"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="border-t border-gray-700">
                    <dl>
                      <div className="bg-gray-750 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-400">Full Name</dt>
                        <dd className="mt-1 text-sm text-gray-200 sm:mt-0 sm:col-span-2">{user.firstName} {user.lastName}</dd>
                      </div>
                      <div className="bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-400">Email</dt>
                        <dd className="mt-1 text-sm text-gray-200 sm:mt-0 sm:col-span-2">{user.email}</dd>
                      </div>
                      <div className="bg-gray-750 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-400">TRC Wallet</dt>
                        <dd className="mt-1 text-sm text-gray-200 sm:mt-0 sm:col-span-2 break-all">
                          {user.trcWallet || 'Not defined'}
                        </dd>
                      </div>
                      <div className="bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-400">Referral Code</dt>
                        <dd className="mt-1 text-sm text-gray-200 sm:mt-0 sm:col-span-2">
                          <span className="font-mono bg-gray-700 px-2 py-1 rounded">{user.referralCode}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(user.referralCode);
                              setSuccess('Referral code copied.');
                              setTimeout(() => setSuccess(null), 3000);
                            }}
                            className="ml-2 text-primary-400 hover:text-primary-300"
                          >
                            Copy
                          </button>
                        </dd>
                      </div>
                      <div className="bg-gray-750 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-400">Registration Date</dt>
                        <dd className="mt-1 text-sm text-gray-200 sm:mt-0 sm:col-span-2">
                          {new Date(user.createdAt).toLocaleDateString('en-US')}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>

              {/* Referrals Section */}
              <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-white">My Referrals</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-400">
                      Users who registered with your referral code
                    </p>
                  </div>
                  <button
                    onClick={() => setShowReferrals(!showReferrals)}
                    className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600"
                  >
                    {showReferrals ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showReferrals && (
                  <div className="border-t border-gray-700">
                    {Array.isArray(user.referrals) && user.referrals.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                          <thead className="bg-gray-900">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                User
                              </th>
                              
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Package Info
                              </th>
                              
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Stake Status
                              </th>
                              
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Registration Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {user.referrals.map((referral: any, index: number) => (
                              <tr key={referral._id || index}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-200">
                                        {referral.firstName?.substring(0, 2)}{'*'.repeat(Math.max(0, (referral.firstName?.length || 0) - 2))}{' '}
                                        {referral.lastName?.substring(0, 2)}{'*'.repeat(Math.max(0, (referral.lastName?.length || 0) - 2))}
                                      </div>
                                      <div className="text-sm text-gray-400">
                                        {referral.email ? 
                                          `${referral.email.substring(0, 2)}${'*'.repeat(Math.max(0, referral.email.length - 10))}${referral.email.substring(referral.email.length - 12)}` 
                                          : 'email@example.com'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-200">
                                    {referral.currentPackageSize > 0 
                                      ? (
                                        <span className="inline-flex items-center">
                                          <span className="font-medium text-primary-400">
                                            {getPackageName(referral.currentPackageSize)} ({referral.currentPackageSize.toLocaleString()} Coin)
                                          </span>
                                          {referral.currentPackageSize >= user.currentPackageSize && (
                                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-900/30 text-green-400">
                                              Bonus Eligible
                                            </span>
                                          )}
                                        </span>
                                      ) 
                                      : (
                                        <span className="inline-flex items-center text-gray-400">
                                          No Package
                                        </span>
                                      )}
                                  </div>
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    referral.currentPackageSize > 0
                                      ? 'bg-green-900/30 text-green-400'
                                      : 'bg-gray-700 text-gray-300'
                                  }`}>
                                    {referral.currentPackageSize > 0 ? 'Active Stake' : 'No Stake'}
                                  </span>
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                  {referral.createdAt ? new Date(referral.createdAt).toLocaleDateString('en-US') : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="px-4 py-5 sm:px-6 text-center">
                        <p className="text-sm text-gray-400">You don't have any referral users yet.</p>
                        <p className="mt-2 text-sm text-gray-400">
                          You can invite your friends by sharing your referral code.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Balance and Summary Information */}
            <div className="lg:col-span-1">
              {/* Balance Card */}
              <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-white">Balance Information</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-400">Account balance and coin status</p>
                </div>
                <div className="border-t border-gray-700">
                  <dl>
                    <div className="bg-gray-750 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-400">USDT Balance</dt>
                      <dd className="mt-1 text-sm text-gray-200 sm:mt-0 sm:col-span-2">
                        ${user.balance !== undefined ? user.balance.toFixed(2) : '0.00'}
                      </dd>
                    </div>
                    <div className="bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-400">Active Coin</dt>
                      <dd className="mt-1 text-sm text-gray-200 sm:mt-0 sm:col-span-2 font-semibold text-primary-400">
                        {user.activeCoin !== undefined ? user.activeCoin.toLocaleString() : '0'} Coin
                      </dd>
                    </div>
                    <div className="bg-gray-750 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-400">Passive Coin</dt>
                      <dd className="mt-1 text-sm text-gray-200 sm:mt-0 sm:col-span-2">
                        {user.passiveCoin !== undefined ? user.passiveCoin.toLocaleString() : '0'} Coin
                      </dd>
                    </div>
                    <div className="bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-400">Referral Earnings</dt>
                      <dd className="mt-1 text-sm text-gray-200 sm:mt-0 sm:col-span-2">
                        {user.referralEarnings !== undefined ? user.referralEarnings.toLocaleString() : '0'} Coin
                      </dd>
                    </div>
                    <div className="bg-gray-750 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-400">Referral Bonus Requirement</dt>
                      <dd className="mt-1 text-sm text-gray-200 sm:mt-0 sm:col-span-2">
                        {Array.isArray(user.referrals) ? (
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <span className={`font-semibold ${
                                user.referrals.filter((ref: any) => ref.currentPackageSize >= user.currentPackageSize).length >= 5
                                  ? 'text-green-400'
                                  : 'text-primary-400'
                              }`}>
                                {user.referrals.filter((ref: any) => ref.currentPackageSize >= user.currentPackageSize).length}/5
                              </span>
                              <span className="ml-2 text-gray-400">
                                {user.referrals.filter((ref: any) => ref.currentPackageSize >= user.currentPackageSize).length >= 5
                                  ? 'Completed'
                                  : 'Pending'}
                              </span>
                            </div>
                            
                            {/* Referral Bonus Period */}
                            {!user.hasReferralBonus && user.referralBonusDeadline && (
                              <div className="mt-2 text-sm">
                                <span className="text-red-400 font-medium">
                                  Time Remaining: {calculateRemainingDays(user.referralBonusDeadline)} days
                                </span>
                                <p className="text-gray-400 text-xs mt-1">
                                  To receive a referral bonus, you need to invite at least 5 people to purchase a package 
                                  equal to or greater than yours within {calculateRemainingDays(user.referralBonusDeadline)} days.
                                </p>
                              </div>
                            )}
                          </div>
                        ) : '0/5'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Referral Information */}
              <div className="bg-gradient-to-r from-primary-900 to-primary-700 shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-white">Invite Your Friends</h3>
                  <div className="mt-3 text-sm text-primary-100">
                    <p>
                      Invite your friends by sharing your referral code. Earn when your friends make stake operations!
                    </p>
                  </div>
                  <div className="mt-5">
                    <div className="rounded-md bg-gray-800 px-3 py-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-gray-200">{user.referralCode}</div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(user.referralCode);
                            setSuccess('Referral code copied.');
                            setTimeout(() => setSuccess(null), 3000);
                          }}
                          className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-200 bg-primary-800 hover:bg-primary-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    
                    {/* Referral Link */}
                    <div className="mt-3">
                      <p className="text-sm text-white mb-2">or share your referral link:</p>
                      <div className="rounded-md bg-gray-800 px-3 py-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="font-mono text-gray-200 text-xs truncate">
                            {typeof window !== 'undefined' ? `${window.location.origin}/register?referral=${user.referralCode}` : ''}
                          </div>
                          <button
                            onClick={() => {
                              if (typeof window !== 'undefined') {
                                navigator.clipboard.writeText(`${window.location.origin}/register?referral=${user.referralCode}`);
                                setSuccess('Referral link copied.');
                                setTimeout(() => setSuccess(null), 3000);
                              }
                            }}
                            className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-200 bg-primary-800 hover:bg-primary-700"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Buttons */}
              <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="p-5 space-y-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/my-stakes')}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-300 bg-gray-700 hover:bg-gray-600"
                  >
                    My Stakes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 