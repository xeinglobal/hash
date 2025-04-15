"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import api from '../services/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Get user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error("Token not found, couldn't fetch user data");
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      // Verify token
      const response = await api.get('/auth/profile');
      
      // Validate user data
      if (!response.data || !response.data._id) {
        console.error("Retrieved user data is invalid:", response.data);
        localStorage.removeItem('token'); // Token is invalid, remove it
        setUser(null);
        setIsAuthenticated(false);
        throw new Error("Invalid user data");
      }
      
      // Also load referral data separately
      try {
        const referralResponse = await api.get('/referrals/info');
        
        // Combine user and referral data
        if (referralResponse.data) {
          const userData = {
            ...response.data,
            referrals: referralResponse.data.referrals || [],
            qualifiedReferrals: referralResponse.data.qualifiedReferrals || [],
            referralBonusQualifiedCount: referralResponse.data.referralBonus?.qualifiedReferrals || 0
          };
          
          // Add referralBonus data directly to all user data
          if (referralResponse.data.referralBonus) {
            userData.currentPackageSize = userData.currentPackageSize || referralResponse.data.referralBonus.currentPackageSize || 0;
            userData.hasReferralBonus = userData.hasReferralBonus !== undefined ? 
              userData.hasReferralBonus : 
              referralResponse.data.referralBonus.hasReceived || false;
          }
          
          setUser(userData);
        } else {
          setUser(response.data);
        }
      } catch (referralError) {
        console.error("Error while retrieving referral data:", referralError);
        // If referral data can't be retrieved, just use the user data
        setUser(response.data);
      }
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error while retrieving user data:", error);
      localStorage.removeItem('token'); // Remove token in case of error
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check user session
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // If token exists, get user data
        fetchUserData();
      } else {
        console.error("Token not found, not logged in");
        setIsLoading(false);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error during token check:", error);
      localStorage.removeItem('token'); // Remove token in case of error
      setIsLoading(false);
      setIsAuthenticated(false);
    }
  }, []);

  const checkLocalStorage = () => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }

  useEffect(() => {
    const isLocalStorageAvailable = checkLocalStorage();
    
    if (!isLocalStorageAvailable) {
      console.error("localStorage is not available! Cookies might be disabled or the browser might be in private mode.");
    }
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Token check
      if (!response.data.token) {
        console.error("Token not found!", response.data);
        throw new Error("Couldn't get token");
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch (storageError) {
        console.error("localStorage error:", storageError);
      }
      
      // Set user data temporarily
      let userData = response.data.user;
      setUser(userData);
      setIsAuthenticated(true);
      
      // Immediately load profile and referral data for more complete information
      try {
        // Now we can make API requests since the token is in the header
        
        // Get referral information
        const referralResponse = await api.get('/referrals/info');
        
        if (referralResponse.data) {
          // Let's also get profile information
          const profileResponse = await api.get('/auth/profile');
          
          // Combine all data
          userData = {
            ...profileResponse.data,
            referrals: referralResponse.data.referrals || [],
            qualifiedReferrals: referralResponse.data.qualifiedReferrals || [],
            referralBonusQualifiedCount: referralResponse.data.referralBonus?.qualifiedReferrals || 0
          };
          
          // Add referralBonus data directly to all user data
          if (referralResponse.data.referralBonus) {
            userData.currentPackageSize = userData.currentPackageSize || referralResponse.data.referralBonus.currentPackageSize || 0;
            userData.hasReferralBonus = userData.hasReferralBonus !== undefined ? 
              userData.hasReferralBonus : 
              referralResponse.data.referralBonus.hasReceived || false;
          }
          
          setUser(userData);
        }
      } catch (additionalDataError) {
        console.error("Error occurred while loading additional data:", additionalDataError);
        // Continue even if there's an error since the login was successful
      }
      
      return response.data; // Return data for use in the login page
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  // Refresh user data
  const refreshUserData = async () => {
    setIsLoading(true);
    await fetchUserData();
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 