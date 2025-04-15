import { Request, Response } from 'express';
import { Withdrawal } from '../models/withdrawal.model';
import { Transaction } from '../models/transaction.model';
import { Settings } from '../models/settings.model';

// Create withdrawal request
export const createWithdrawal = async (req: Request, res: Response) => {
  try {
    console.log('Withdrawal request received:', req.body);
    console.log('User object in request:', req.user);
    
    const { amount, trcWallet } = req.body;
    // Getting userId correctly - userId is set in auth middleware
    const userId = req.user?.userId;
    
    if (!userId) {
      console.log('User ID not found in request, req.user:', req.user);
      return res.status(401).json({ message: 'User identity could not be verified' });
    }

    if (!trcWallet) {
      console.log('TRC wallet is missing in request');
      return res.status(400).json({ message: 'TRC20 wallet address is required' });
    }

    if (!amount) {
      console.log('Amount is missing in request');
      return res.status(400).json({ message: 'Withdrawal amount must be specified' });
    }

    console.log('Finding settings with validated userId:', userId);
    // Minimum withdrawal check
    const settings = await Settings.findOne();
    console.log('Settings found:', settings);
    
    if (!settings) {
      console.log('Settings not found');
      return res.status(500).json({ message: 'System settings not found' });
    }

    if (amount < settings.minWithdrawal) {
      console.log(`Amount ${amount} is less than minimum withdrawal ${settings.minWithdrawal}`);
      return res.status(400).json({ 
        message: `Minimum withdrawal amount should be ${settings.minWithdrawal} TRC20` 
      });
    }

    // Check user's balance
    const { User } = require('../models/user.model');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.balance < amount) {
      return res.status(400).json({ 
        message: 'Insufficient balance',
        currentBalance: user.balance,
        requestedAmount: amount
      });
    }

    // Reduce user's balance by the withdrawal amount
    user.balance -= amount;
    user.updatedAt = new Date();
    await user.save();
    console.log(`User ${userId} balance updated: -${amount}. New balance: ${user.balance}`);

    console.log('Creating withdrawal record with userId:', userId);
    // Create a new withdrawal record
    const withdrawal = new Withdrawal({
      user: userId,
      amount,
      trcWallet,
      status: 'pending'
    });

    await withdrawal.save();
    console.log('Withdrawal saved:', withdrawal);

    console.log('Creating transaction record with userId:', userId);
    // Create a transaction record for transaction history
    const transaction = new Transaction({
      user: userId,
      type: 'withdrawal',
      amount,
      status: 'pending'
    });

    await transaction.save();
    console.log('Transaction saved:', transaction);

    return res.status(201).json({ 
      message: 'Withdrawal request created successfully', 
      withdrawal 
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return res.status(500).json({ message: 'Withdrawal operation failed' });
  }
};

// Get user's withdrawal operations
export const getUserWithdrawals = async (req: Request, res: Response) => {
  try {
    // Get userId correctly
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User identity could not be verified' });
    }
    
    const withdrawals = await Withdrawal.find({ user: userId })
      .sort({ createdAt: -1 });
    
    return res.status(200).json(withdrawals);
  } catch (error) {
    console.error('Withdrawal history error:', error);
    return res.status(500).json({ message: 'Could not retrieve withdrawal history' });
  }
};

// Admin: Get all withdrawal operations
export const getAllWithdrawals = async (req: Request, res: Response) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    // Convert user information to userInfo object and handle trc20Address correctly
    const withdrawalsWithUserInfo = withdrawals.map(withdrawal => {
      const userObj = withdrawal.user as any;
      return {
        ...withdrawal.toObject(),
        userInfo: {
          username: userObj ? (userObj.firstName || '') + ' ' + (userObj.lastName || '') : 'Anonymous',
          email: userObj ? userObj.email : 'No Email'
        },
        // Set trc20Address as empty string if undefined to prevent substring error
        trc20Address: withdrawal.trcWallet || ''
      };
    });
    
    return res.status(200).json(withdrawalsWithUserInfo);
  } catch (error) {
    console.error('All withdrawal operations error:', error);
    return res.status(500).json({ message: 'Could not retrieve withdrawal operations' });
  }
};

// Admin: Update withdrawal status (approve/reject)
export const updateWithdrawalStatus = async (req: Request, res: Response) => {
  try {
    const { withdrawalId, status, txHash } = req.body;
    console.log(`Updating withdrawal status: ID=${withdrawalId}, status=${status}, txHash=${txHash || 'none'}`);
    
    if (!['approved', 'rejected'].includes(status)) {
      console.log(`Invalid status: ${status}`);
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const withdrawal = await Withdrawal.findById(withdrawalId);
    
    if (!withdrawal) {
      console.log(`Withdrawal not found with ID: ${withdrawalId}`);
      return res.status(404).json({ message: 'Withdrawal operation not found' });
    }
    
    console.log(`Found withdrawal: ${withdrawal._id}, current status: ${withdrawal.status}`);
    
    // If already approved or rejected, don't process again
    if (withdrawal.status !== 'pending') {
      console.log(`Withdrawal already processed: ${withdrawal.status}`);
      return res.status(400).json({ 
        message: 'This operation has already been approved or rejected',
        currentStatus: withdrawal.status
      });
    }
    
    withdrawal.status = status;
    
    if (txHash && status === 'approved') {
      withdrawal.txHash = txHash;
    }
    
    await withdrawal.save();
    console.log(`Withdrawal status updated to ${status}`);
    
    // Update the related transaction record
    const transaction = await Transaction.findOne({
      user: withdrawal.user,
      type: 'withdrawal',
      amount: withdrawal.amount,
      createdAt: { $gte: new Date(withdrawal.createdAt.getTime() - 60000) } // 1 minute tolerance
    });
    
    if (transaction) {
      console.log(`Found related transaction: ${transaction._id}, updating status to ${status}`);
      transaction.status = status;
      if (txHash && status === 'approved') {
        transaction.transactionHash = txHash;
      }
      await transaction.save();
      console.log('Transaction updated');
    } else {
      console.log('No related transaction found');
    }
    
    // If operation is rejected, refund the user
    if (status === 'rejected') {
      const { User } = require('../models/user.model');
      const user = await User.findById(withdrawal.user);
      
      if (user) {
        console.log(`Refunding to user balance: Current=${user.balance}, Adding=${withdrawal.amount}`);
        user.balance += withdrawal.amount; // Refund
        user.updatedAt = new Date();
        await user.save();
        console.log(`User ${user._id} balance refunded: +${withdrawal.amount}. New balance: ${user.balance}`);
      } else {
        console.error(`User ${withdrawal.user} not found while refunding balance`);
      }
    }
    
    console.log('Sending response');
    return res.status(200).json({ 
      message: `Withdrawal operation ${status === 'approved' ? 'approved' : 'rejected'}`, 
      withdrawal,
      balanceUpdated: status === 'rejected' // Flag indicating balance was updated when rejected
    });
  } catch (error) {
    console.error('Withdrawal status update error:', error);
    return res.status(500).json({ message: 'Withdrawal status could not be updated' });
  }
}; 