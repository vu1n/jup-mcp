import express from 'express';
import swapService from '../services/swap.js';
import { ValidationError, ServiceError } from '../utils/errors.js';

const router = express.Router();

// Get supported tokens
router.get('/tokens', async (req, res, next) => {
  try {
    const result = await swapService.getTokens();
    if (!result) {
      throw new ServiceError('Failed to fetch supported tokens');
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get recent transactions
router.get('/transactions', async (req, res, next) => {
  try {
    const { tokenAddress, limit = 10, offset = 0 } = req.query;

    if (isNaN(Number(limit)) || Number(limit) <= 0 || Number(limit) > 100) {
      throw new ValidationError('Limit must be a positive number not exceeding 100');
    }

    if (isNaN(Number(offset)) || Number(offset) < 0) {
      throw new ValidationError('Offset must be a non-negative number');
    }

    const result = await swapService.getTransactions({
      tokenAddress,
      limit: Number(limit),
      offset: Number(offset)
    });

    if (!result) {
      throw new ServiceError('Failed to fetch transactions');
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router; 