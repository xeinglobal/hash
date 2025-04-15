'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, { email });
      
      toast.success("Password reset instructions have been sent to your email");
      setIsSubmitted(true);
    } catch (error) {
      toast.error("There was a problem processing your password reset request");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black/20 flex flex-col justify-center py-12 px-6 sm:px-10 md:px-16 lg:px-24">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Email Sent
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Password reset instructions have been sent to your email.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-transparent py-8 px-8 shadow sm:rounded-lg sm:px-12 border border-gray-700">
            <div className="space-y-6">
              <p className="text-sm text-gray-300">
                Please check your inbox and click the link in the email to reset your password.
              </p>
              <p className="text-sm text-gray-400">
                If you didn't receive an email, check your spam folder or try again.
              </p>
              <div>
                <Link href="/login">
                  <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Return to Login Page
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/20 backdrop-blur-md flex flex-col justify-center py-12 px-6 sm:px-10 md:px-16 lg:px-24">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Forgot Your Password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Enter your email address and we'll send you a password reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-sm py-8 px-8 shadow sm:rounded-lg sm:px-12 border border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-white"
                  placeholder="example@mail.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send Password Reset Link"}
              </button>
            </div>
            
            <div>
              <Link href="/login">
                <button type="button" className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Return to Login Page
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 