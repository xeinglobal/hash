import { Request, Response } from 'express';
import { Deposit } from '../models/deposit.model';
import { Transaction } from '../models/transaction.model';
import { Settings } from '../models/settings.model';

// Create deposit request
export const createDeposit = async (req: Request, res: Response) => {
  try {
    console.log('Deposit request received:', req.body);
    console.log('User object in request:', req.user);
    
    const { amount } = req.body;
    
    // We get the userId correctly - userId is set in auth middleware
    const userId = req.user?.userId;
    
    if (!userId) {
      console.log('User ID not found in request, req.user:', req.user);
      return res.status(401).json({ message: 'User identity could not be verified' });
    }

    if (!amount) {
      console.log('Amount is missing in request');
      return res.status(400).json({ message: 'Deposit amount must be specified' });
    }

    console.log('Finding settings with validated userId:', userId);
    // Minimum deposit check
    const settings = await Settings.findOne();
    console.log('Settings found:', settings);
    
    if (!settings) {
      console.log('Settings not found');
      return res.status(500).json({ message: 'System settings not found' });
    }

    if (amount < settings.minDeposit) {
      console.log(`Amount ${amount} is less than minimum deposit ${settings.minDeposit}`);
      return res.status(400).json({ 
        message: `Minimum deposit amount must be ${settings.minDeposit} TRC20` 
      });
    }

    console.log('Creating deposit record with userId:', userId);
    // Create new deposit record
    const deposit = new Deposit({
      user: userId,
      amount,
      trcWallet: settings.trc20Wallet,
      status: 'pending'
    });

    await deposit.save();
    console.log('Deposit saved:', deposit);

    console.log('Creating transaction record with userId:', userId);
    // Create transaction record for transaction history
    const transaction = new Transaction({
      user: userId,
      type: 'deposit',
      amount,
      status: 'pending'
    });

    await transaction.save();
    console.log('Transaction saved:', transaction);

    return res.status(201).json({ 
      message: 'Deposit request successfully created', 
      deposit 
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return res.status(500).json({ message: 'Deposit operation failed' });
  }
};

// Get user's deposit operations
export const getUserDeposits = async (req: Request, res: Response) => {
  try {
    // Get userId correctly
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User identity could not be verified' });
    }
    
    const deposits = await Deposit.find({ user: userId })
      .sort({ createdAt: -1 });
    
    return res.status(200).json(deposits);
  } catch (error) {
    console.error('Deposit history error:', error);
    return res.status(500).json({ message: 'Could not get deposit history' });
  }
};

// Admin: Get all deposit operations
export const getAllDeposits = async (req: Request, res: Response) => {
  try {
    const deposits = await Deposit.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    // Convert user information to userInfo object
    const depositsWithUserInfo = deposits.map(deposit => {
      const userObj = deposit.user as any;
      return {
        ...deposit.toObject(),
        userInfo: {
          username: userObj ? (userObj.firstName || '') + ' ' + (userObj.lastName || '') : 'Unnamed',
          email: userObj ? userObj.email : 'No email'
        }
      };
    });
    
    return res.status(200).json(depositsWithUserInfo);
  } catch (error) {
    console.error('All deposit operations error:', error);
    return res.status(500).json({ message: 'Could not get deposit operations' });
  }
};

// Admin: Update deposit status (approve/reject)
export const updateDepositStatus = async (req: Request, res: Response) => {
  try {
    const { depositId, status, transactionHash } = req.body;
    console.log(`Updating deposit status: ID=${depositId}, status=${status}`);
    
    if (!['approved', 'rejected'].includes(status)) {
      console.log(`Invalid status: ${status}`);
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const deposit = await Deposit.findById(depositId);
    
    if (!deposit) {
      console.log(`Deposit not found with ID: ${depositId}`);
      return res.status(404).json({ message: 'Deposit operation not found' });
    }

    console.log(`Found deposit: ${deposit._id}, current status: ${deposit.status}`);

    // If previously approved or rejected, do not process again
    if (deposit.status !== 'pending') {
      console.log(`Deposit already processed: ${deposit.status}`);
      return res.status(400).json({ 
        message: 'This operation has already been approved or rejected',
        currentStatus: deposit.status
      });
    }
    
    deposit.status = status;
    deposit.updatedAt = new Date();
    
    if (transactionHash) {
      deposit.txHash = transactionHash;
    }
    
    await deposit.save();
    console.log(`Deposit status updated to ${status}`);
    
    // Update the related transaction record
    const transaction = await Transaction.findOne({
      user: deposit.user,
      type: 'deposit',
      amount: deposit.amount,
      createdAt: { $gte: new Date(deposit.createdAt.getTime() - 60000) } // 1 minute tolerance
    });
    
    if (transaction) {
      console.log(`Found related transaction: ${transaction._id}, updating status to ${status}`);
      transaction.status = status;
      if (transactionHash) {
        transaction.transactionHash = transactionHash;
      }
      await transaction.save();
      console.log('Transaction updated');
    } else {
      console.log('No related transaction found');
    }

    // If operation is approved, increase user's balance
    if (status === 'approved') {
      // Find the related user
      const { User } = require('../models/user.model');
      const user = await User.findById(deposit.user);
      
      if (user) {
        console.log(`Updating user balance: Current=${user.balance}, Adding=${deposit.amount}`);
        user.balance += deposit.amount;
        user.updatedAt = new Date();
        await user.save();
        console.log(`User ${user._id} balance updated: +${deposit.amount}. New balance: ${user.balance}`);
      } else {
        console.error(`User ${deposit.user} not found while updating balance`);
      }
    }
    
    console.log('Sending response');
    return res.status(200).json({ 
      message: `Deposit operation ${status === 'approved' ? 'approved' : 'rejected'}`, 
      deposit,
      balanceUpdated: status === 'approved'
    });
  } catch (error) {
    console.error('Deposit status update error:', error);
    return res.status(500).json({ message: 'Could not update deposit status' });
  }
}; 