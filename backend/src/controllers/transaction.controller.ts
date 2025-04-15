import { Request, Response } from 'express';
import { Transaction } from '../models/transaction.model';

// Kullanıcının tüm işlem geçmişini getir
export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    console.log('getUserTransactions çağrıldı, req.user:', req.user);
    const userId = req.user?.userId;
    
    if (!userId) {
      console.error('Kullanıcı ID bulunamadı:', req.user);
      return res.status(401).json({ message: 'Kullanıcı kimliği bulunamadı' });
    }
    
    console.log('İşlem geçmişi sorgulanıyor, userId:', userId);
    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 });
    
    console.log('İşlem geçmişi bulundu, toplam:', transactions.length);
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('İşlem geçmişi hatası:', error);
    return res.status(500).json({ message: 'İşlem geçmişi alınamadı' });
  }
};

// Kullanıcının belirli tip işlem geçmişini getir
export const getUserTransactionsByType = async (req: Request, res: Response) => {
  try {
    console.log('getUserTransactionsByType çağrıldı, req.user:', req.user);
    const userId = req.user?.userId;
    const { type } = req.params;
    
    if (!userId) {
      console.error('Kullanıcı ID bulunamadı:', req.user);
      return res.status(401).json({ message: 'Kullanıcı kimliği bulunamadı' });
    }
    
    if (!['deposit', 'withdrawal', 'stake', 'buy_coin', 'sell_coin'].includes(type)) {
      return res.status(400).json({ message: 'Geçersiz işlem tipi' });
    }
    
    console.log(`${type} tipindeki işlem geçmişi sorgulanıyor, userId:`, userId);
    
    // Eğer stake tipiyse, tüm stake ile ilgili işlemleri getir
    let query = {};
    if (type === 'stake') {
      query = { 
        user: userId,
        type: { $in: ['stake', 'stake_start', 'stake_complete'] }
      };
    } else {
      query = { 
        user: userId,
        type
      };
    }
    
    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    
    console.log(`${type} tipindeki işlem geçmişi bulundu, toplam:`, transactions.length);
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('İşlem geçmişi hatası:', error);
    return res.status(500).json({ message: 'İşlem geçmişi alınamadı' });
  }
};

// Admin: Tüm işlem geçmişini getir
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Tüm işlemler hatası:', error);
    return res.status(500).json({ message: 'İşlemler alınamadı' });
  }
};

// Admin: Belirli tipteki tüm işlemleri getir
export const getAllTransactionsByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    if (!['deposit', 'withdrawal', 'stake', 'stake_start', 'stake_complete', 'buy_coin', 'sell_coin'].includes(type)) {
      return res.status(400).json({ message: 'Geçersiz işlem tipi' });
    }
    
    // Eğer stake tipiyse, tüm stake ile ilgili işlemleri getir
    let query = {};
    if (type === 'stake') {
      query = { 
        type: { $in: ['stake', 'stake_start', 'stake_complete'] }
      };
    } else {
      query = { type };
    }
    
    const transactions = await Transaction.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('İşlemler hatası:', error);
    return res.status(500).json({ message: 'İşlemler alınamadı' });
  }
}; 