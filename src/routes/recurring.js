import express from 'express';
import recurringService from '../services/recurring.js';

const router = express.Router();

// Create recurring payment
router.post('/create', async (req, res) => {
  try {
    const { inputToken, outputToken, amount, frequency, walletAddress } = req.body;
    if (!inputToken || !outputToken || !amount || !frequency || !walletAddress) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters'
      });
    }
    const result = await recurringService.createRecurringPayment({
      inputToken,
      outputToken,
      amount,
      frequency,
      walletAddress
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get recurring payments
router.get('/list/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const result = await recurringService.getRecurringPayments(walletAddress);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Cancel recurring payment
router.post('/cancel/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = await recurringService.cancelRecurringPayment(paymentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router; 