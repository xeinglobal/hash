import { Request, Response } from 'express';
import { StakePackage, IStakePackage } from '../models/stake-package.model';

// Get all stake packages
export const getAllStakePackages = async (req: Request, res: Response) => {
  try {
    const stakePackages = await StakePackage.find({ isActive: true });
    res.json(stakePackages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get stake package by ID
export const getStakePackageById = async (req: Request, res: Response) => {
  try {
    const stakePackage = await StakePackage.findById(req.params.id);
    if (!stakePackage) {
      return res.status(404).json({ message: 'Stake package not found' });
    }
    res.json(stakePackage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Create new stake package
export const createStakePackage = async (req: Request, res: Response) => {
  try {
    const { name, priceInCoins, durations } = req.body;
    
    // Basic validation
    if (!name || !priceInCoins || !durations || !Array.isArray(durations) || durations.length === 0) {
      return res.status(400).json({ message: 'Invalid stake package information' });
    }
    
    // Durations validation
    for (const duration of durations) {
      if (!duration.days || !duration.profitRate) {
        return res.status(400).json({ message: 'Invalid duration information' });
      }
    }
    
    const newStakePackage = new StakePackage({
      name,
      priceInCoins,
      durations,
      isActive: true
    });
    
    const savedStakePackage = await newStakePackage.save();
    res.status(201).json(savedStakePackage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update stake package
export const updateStakePackage = async (req: Request, res: Response) => {
  try {
    const { name, priceInCoins, durations, isActive } = req.body;
    
    // Basic validation
    if (durations && (!Array.isArray(durations) || durations.length === 0)) {
      return res.status(400).json({ message: 'Invalid duration information' });
    }
    
    // Durations validation
    if (durations) {
      for (const duration of durations) {
        if (!duration.days || !duration.profitRate) {
          return res.status(400).json({ message: 'Invalid duration information' });
        }
      }
    }
    
    const updatedStakePackage = await StakePackage.findByIdAndUpdate(
      req.params.id, 
      { name, priceInCoins, durations, isActive },
      { new: true, runValidators: true }
    );
    
    if (!updatedStakePackage) {
      return res.status(404).json({ message: 'Stake package not found' });
    }
    
    res.json(updatedStakePackage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete stake package
export const deleteStakePackage = async (req: Request, res: Response) => {
  try {
    const deletedStakePackage = await StakePackage.findByIdAndDelete(req.params.id);
    
    if (!deletedStakePackage) {
      return res.status(404).json({ message: 'Stake package not found' });
    }
    
    res.json({ message: 'Stake package successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}; 