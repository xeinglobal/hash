import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { CoinPrice } from '../models/coin-price.model';
import { CoinConversionStatus } from '../models/coin-conversion-status.model';
import { Transaction } from '../models/transaction.model';
import mongoose from 'mongoose';

// Buy coin with balance
export const buyCoin = async (req: Request, res: Response) => {
  try {
    console.log('buyCoin called, req.user:', req.user);
    const userId = req.user?.userId;
    if (!userId) {
      console.error('User ID not found:', req.user);
      return res.status(401).json({ message: 'User identity could not be verified' });
    }

    const { amount } = req.body;
    console.log('Starting coin purchase, amount:', amount, 'userId:', userId);
    
    // Amount check (balance amount)
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Get active coin price
    console.log('Querying active coin price...');
    const currentPrice = await CoinPrice.findOne({ isActive: true });
    console.log('Coin price query result:', currentPrice);
    
    if (!currentPrice) {
      return res.status(404).json({ message: 'Active coin price not found. Please try again later.' });
    }

    // Find user
    console.log('Querying user information, userId:', userId);
    const user = await User.findById(userId);
    console.log('User query result:', user ? `User found, balance: ${user.balance}` : 'User not found');
    
    if (!user) {
      console.error('User not found, userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Balance check
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Calculate the amount of coins that can be purchased
    const coinAmount = parseFloat((amount / currentPrice.pricePerUnit).toFixed(4));
    console.log('Calculated coin amount:', coinAmount);

    // Deduct from user balance, add to active coin
    user.balance -= amount;
    user.activeCoin += coinAmount;
    
    console.log('Updating user information...');
    console.log('New balance:', user.balance, 'New active coin:', user.activeCoin);
    
    try {
      await user.save();
      console.log('User information updated');
      
      // Create transaction record
      try {
        const transaction = new Transaction({
          user: userId,
          type: 'buy_coin',
          amount: amount,
          status: 'approved',
          createdAt: new Date()
        });
        await transaction.save();
        console.log('Coin purchase transaction record created:', transaction._id);
      } catch (transactionError: any) {
        console.error('Error creating transaction record:', transactionError.message);
        // Transaction record creation error doesn't affect the process, continue
      }
      
      console.log('Coin purchase successful, userId:', userId, 'amount:', amount, 'coinAmount:', coinAmount);
      res.json({
        message: 'Coin purchase successful',
        amountPaid: amount,
        coinsReceived: coinAmount,
        balance: user.balance,
        activeCoin: user.activeCoin,
        coinPrice: currentPrice.pricePerUnit
      });
    } catch (saveError: any) {
      console.error('Error saving user information:', saveError);
      console.error('Error details:', saveError.message);
      console.error('Error stack:', saveError.stack);
      return res.status(500).json({ 
        message: 'Error while updating user information', 
        error: saveError.message,
        errorName: saveError.name
      });
    }
  } catch (error: any) {
    console.error('Coin purchase error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      errorCode: error.code,
      errorName: error.name
    });
  }
};

// Convert active coin to balance
export const convertCoinToBalance = async (req: Request, res: Response) => {
  try {
    console.log('convertCoinToBalance called, req.user:', req.user);
    const userId = req.user?.userId;
    if (!userId) {
      console.error('User ID not found:', req.user);
      return res.status(401).json({ message: 'User identity could not be verified' });
    }

    // Check coin conversion status
    const conversionStatus = await CoinConversionStatus.getCurrentStatus();
    if (!conversionStatus || !conversionStatus.isActive) {
      return res.status(403).json({ 
        message: 'Coin conversion is not currently active',
        reason: conversionStatus ? conversionStatus.reason : 'Disabled by system administrator.'
      });
    }

    const { coinAmount } = req.body;
    console.log('Starting coin conversion, coinAmount:', coinAmount, 'userId:', userId);
    
    // Amount check (coin amount)
    if (!coinAmount || coinAmount <= 0) {
      return res.status(400).json({ message: 'Invalid coin amount' });
    }

    // Get active coin price
    console.log('Querying active coin price...');
    const currentPrice = await CoinPrice.findOne({ isActive: true });
    console.log('Coin price query result:', currentPrice);
    
    if (!currentPrice) {
      return res.status(404).json({ message: 'Active coin price not found. Please try again later.' });
    }

    // Find user
    console.log('Querying user information, userId:', userId);
    const user = await User.findById(userId);
    console.log('User query result:', user ? `User found, active coin: ${user.activeCoin}` : 'User not found');
    
    if (!user) {
      console.error('User not found, userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Active coin check
    if (user.activeCoin < coinAmount) {
      return res.status(400).json({ message: 'Insufficient coin amount' });
    }

    // Calculate the balance amount to be received from conversion
    const balanceAmount = parseFloat((coinAmount * currentPrice.pricePerUnit).toFixed(2));
    console.log('Calculated balance amount:', balanceAmount);

    // Deduct from active coin, add to balance
    user.activeCoin -= coinAmount;
    user.balance += balanceAmount;
    
    console.log('Updating user information...');
    console.log('New balance:', user.balance, 'New active coin:', user.activeCoin);
    
    try {
      await user.save();
      console.log('User information updated');
      
      // Create transaction record
      try {
        const transaction = new Transaction({
          user: userId,
          type: 'sell_coin',
          amount: coinAmount,
          status: 'approved',
          createdAt: new Date()
        });
        await transaction.save();
        console.log('Coin conversion transaction record created:', transaction._id);
      } catch (transactionError: any) {
        console.error('Error creating transaction record:', transactionError.message);
        // Transaction record creation error doesn't affect the process, continue
      }
      
      console.log('Coin conversion successful, userId:', userId, 'coinAmount:', coinAmount, 'balanceAmount:', balanceAmount);
      res.json({
        message: 'Coin conversion successful',
        coinsConverted: coinAmount,
        balanceReceived: balanceAmount,
        balance: user.balance,
        activeCoin: user.activeCoin,
        coinPrice: currentPrice.pricePerUnit
      });
    } catch (saveError: any) {
      console.error('Error saving user information:', saveError);
      console.error('Error details:', saveError.message);
      console.error('Error stack:', saveError.stack);
      return res.status(500).json({ 
        message: 'Error while updating user information', 
        error: saveError.message,
        errorName: saveError.name 
      });
    }
  } catch (error: any) {
    console.error('Coin conversion error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      errorCode: error.code,
      errorName: error.name
    });
  }
};

// Get coin conversion status
export const getConversionStatus = async (req: Request, res: Response) => {
  try {
    const status = await CoinConversionStatus.getCurrentStatus();
    
    if (!status) {
      return res.json({
        isActive: false,
        message: 'Coin conversion status has not been determined yet'
      });
    }
    
    res.json({
      isActive: status.isActive,
      lastUpdatedAt: status.lastUpdatedAt,
      reason: status.reason,
      message: status.isActive 
        ? 'Coin conversion is currently active' 
        : 'Coin conversion is currently disabled'
    });
  } catch (error: any) {
    console.error('Error getting conversion status:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
}; 