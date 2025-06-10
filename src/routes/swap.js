import express from 'express';
import swapService from '../services/swap.js';

const router = express.Router();

// Get supported tokens
router.get('/tokens', async (req, res) => {
  try {
    const result = await swapService.getTokens();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get recent transactions
router.get('/transactions', async (req, res) => {
  try {
    const { tokenAddress, limit, offset } = req.query;
    const result = await swapService.getTransactions({
      tokenAddress,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router; 