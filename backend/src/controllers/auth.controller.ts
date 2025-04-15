import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import mongoose from 'mongoose';
import { createNotification } from './notification.controller';
import crypto from 'crypto';
import { PasswordReset } from '../models/password-reset.model';
import { sendPasswordResetEmail } from '../utils/email.service';

const JWT_SECRET = process.env.JWT_SECRET || 'gizli-anahtar';

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, trcWallet, referralCode } = req.body;
    
    // Email check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered' });
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create referral code (new code for user)
    const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      trcWallet,
      referralCode: newReferralCode,
      referrals: [], // Start with empty referrals array
    });

    // Referrer check
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode });
      
      if (referrer) {
        
        user.referredBy = referrer._id as mongoose.Types.ObjectId;
        
        // Save new user
        await user.save();
        
        
        // Add this user to referrer
        const updateResult = await User.findByIdAndUpdate(
          referrer._id,
          { $push: { referrals: user._id } },
          { new: true }
        );
        
        // Start referral bonus check
        try {
          await checkUserReferralBonusEligibility(referrer._id as mongoose.Types.ObjectId);
          
          // Mask names (for privacy)
          const maskedFirstName = firstName.charAt(0) + '*'.repeat(firstName.length - 1);
          const maskedLastName = lastName.charAt(0) + '*'.repeat(lastName.length - 1);
          
          // Send notification to the referrer
          await createNotification(
            referrer._id as unknown as string,
            'New Referral Registration',
            `${maskedFirstName} ${maskedLastName} has registered using your referral code.`,
            'referral'
          );
        } catch (error) {
          console.error('Error during referral bonus check:', error);
          // Bonus check error does not affect the main process
        }
      } else {
        // Save user even if referrer not found
        await user.save();
        
      }
    } else {
      // Save user if no referral code
      await user.save();
      
    }

    // Create token (for automatic login)
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

    // Return user information, excluding sensitive data (in the same format as login)
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      trcWallet: user.trcWallet,
      balance: user.balance,
      activeCoin: user.activeCoin,
      passiveCoin: user.passiveCoin,
      referralCode: user.referralCode,
      isAdmin: user.isAdmin,
      referralBonusDeadline: user.referralBonusDeadline,
      createdAt: user.createdAt,
      referredBy: user.referredBy,
      referrals: user.referrals
    };

    // Send successful registration message and login information
    res.status(201).json({ 
      message: 'Registration successful, automatically logged in', 
      token, 
      user: userResponse 
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: 'Registration failed', error: (error as Error).message });
  }
};

// Check referral bonus eligibility for a single user - Without transaction
export const checkUserReferralBonusEligibility = async (userId: mongoose.Types.ObjectId) => {
  try {
    // Find user
    const user = await User.findById(userId);
    
    // If user not found, already has bonus, or has no package size, don't process
    if (!user || user.hasReferralBonus || user.currentPackageSize <= 0) {
      return false;
    }
    
    // Check time limit - If 30-day period has expired, bonus right is lost
    const currentDate = new Date();
    if (user.referralBonusDeadline && user.referralBonusDeadline < currentDate) {
      // Mark that user has lost bonus chance (optional)
      await User.findByIdAndUpdate(userId, {
        $set: { referralBonusDeadline: null } // Time expired, can mark as null
      });
      
      return false;
    }

    // Find users referred by this user - with the same or larger package size as the user's currentPackageSize
    const referrals = await User.find({
      referredBy: user._id,
      currentPackageSize: { $gte: user.currentPackageSize } // Must have purchased at least as large a package as the referrer
    });

    // If enough referrals (5) and these referrals have purchased packages of sufficient size, give bonus
    if (referrals.length >= 5) {
      // Add bonus to user's active coin account
      // Bonus amount is equal to user's first package (currentPackageSize) amount
      await User.findByIdAndUpdate(userId, {
        $inc: { activeCoin: user.currentPackageSize }, // Give bonus equal to first package amount
        $set: { 
          hasReferralBonus: true,
          referralBonusDeadline: null // Bonus given, no need for deadline anymore
        }
      });
      
      // Send notification when referral bonus is completed
      await createNotification(
        userId.toString(),
        'Referral Bonus Earned!',
        `Congratulations! You have completed the referral bonus requirements and ${user.currentPackageSize} Coins have been added to your account.`,
        'bonus'
      );
      
      return true;
    } else if (referrals.length > 0) {
      // Update the number of qualifying referrals
      await User.findByIdAndUpdate(userId, {
        $set: { referralBonusQualifiedCount: referrals.length }
      });
    }
    
    return false;
  } catch (error) {
    console.error(`Referral bonus check error (User ID: ${userId}):`, error);
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

    // Remove sensitive information and return user data
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      trcWallet: user.trcWallet,
      balance: user.balance,
      activeCoin: user.activeCoin,
      passiveCoin: user.passiveCoin,
      referralCode: user.referralCode,
      isAdmin: user.isAdmin,
      referralBonusDeadline: user.referralBonusDeadline,
      createdAt: user.createdAt
    };

    res.json({ token, user: userResponse });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // First get basic user information without references
    const basicUser = await User.findById(req.user.userId).select('-password');
    if (!basicUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Now get complete user information with populated references
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate({
        path: 'referrals',
        select: 'firstName lastName email createdAt currentPackageSize'
      })
      .populate({
        path: 'referredBy',
        select: 'firstName lastName email referralCode'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (Array.isArray(user.referrals) && user.referrals.length > 0) {
      // ... existing code ...
    }
    
    user.referredBy = user.referredBy || null;
    
    res.json(user);
  } catch (error) {
    console.error("Error retrieving profile:", error);
    res.status(500).json({ message: 'Could not retrieve user information' });
  }
};

// Create password reset request
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email address required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, return success message even if user doesn't exist
      return res.status(200).json({ 
        message: 'Password reset instructions have been sent to your email address' 
      });
    }
    
    // Create random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Clear existing reset tokens
    await PasswordReset.deleteMany({ userId: user._id });
    
    // Save token to database
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1); // Valid for 1 hour
    
    const passwordReset = new PasswordReset({
      userId: user._id,
      email: user.email,
      token: resetToken,
      expiresAt: expiryDate
    });
    
    await passwordReset.save();
    
    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    // Send email
    const emailResult = await sendPasswordResetEmail(
      user.email, 
      resetLink, 
      `${user.firstName} ${user.lastName}`
    );
    
    res.status(200).json({ 
      message: 'Password reset instructions have been sent to your email address' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      message: 'An error occurred while processing the password reset request' 
    });
  }
};

// Validate password reset token
export const validateResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    const passwordReset = await PasswordReset.findOne({
      token,
      expiresAt: { $gt: new Date() }
    });
    
    if (!passwordReset) {
      return res.status(400).json({ 
        message: 'Invalid or expired token', 
        valid: false 
      });
    }
    
    res.status(200).json({ 
      message: 'Token valid', 
      valid: true,
      email: passwordReset.email
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ 
      message: 'An error occurred while validating the token', 
      valid: false 
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ 
        message: 'Token and new password required' 
      });
    }
    
    const passwordReset = await PasswordReset.findOne({
      token,
      expiresAt: { $gt: new Date() }
    });
    
    if (!passwordReset) {
      return res.status(400).json({ 
        message: 'Invalid or expired token' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user password
    await User.findByIdAndUpdate(
      passwordReset.userId,
      { $set: { password: hashedPassword } }
    );
    
    // Send notification to user
    await createNotification(
      passwordReset.userId.toString(),
      'Password Updated',
      'Your account password has been successfully changed.',
      'system'
    );
    
    // Delete reset token
    await PasswordReset.deleteMany({ userId: passwordReset.userId });
    
    res.status(200).json({ 
      message: 'Your password has been successfully reset' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      message: 'An error occurred while resetting your password' 
    });
  }
}; 