import express from 'express';
import recurringService from '../services/recurring.js';

const router = express.Router();

// Create a new recurring payment
router.post('/create', async (req, res) => {
  try {
    const { inputToken, outputToken, amount, frequency, walletAddress } = req.body;
    
    if (!inputToken || !outputToken || !amount || !frequency || !walletAddress) {
      return res.status(400).json({
        error: 'Missing required parameters'
      });
    }

    const payment = await recurringService.createRecurringPayment({
      inputToken,
      outputToken,
      amount,
      frequency,
      walletAddress
    });

    res.json(payment);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Get all recurring payments for a wallet
router.get('/list/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json({
        error: 'Missing wallet address'
      });
    }

    const payments = await recurringService.getRecurringPayments(walletAddress);
    res.json(payments);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Cancel a recurring payment
router.post('/cancel', async (req, res) => {
  try {
    const { paymentId } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({
        error: 'Missing payment ID'
      });
    }

    const result = await recurringService.cancelRecurringPayment(paymentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

export default router; 