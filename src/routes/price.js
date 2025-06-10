import express from 'express';
import priceService from '../services/price.js';
import { validateTokenAddress } from '../utils/validation.js';
import { ValidationError, NotFoundError, ServiceError } from '../utils/errors.js';

const router = express.Router();

// Get price for a single pair
router.get('/:inputToken/:outputToken', async (req, res, next) => {
  try {
    const { inputToken, outputToken } = req.params;
    
    if (!validateTokenAddress(inputToken)) {
      throw new ValidationError('Invalid input token address format');
    }

    if (!validateTokenAddress(outputToken)) {
      throw new ValidationError('Invalid output token address format');
    }

    const result = await priceService.getPrice(inputToken, outputToken);
    if (!result) {
      throw new NotFoundError('Price not available');
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get prices for multiple pairs
router.post('/batch', async (req, res, next) => {
  try {
    const { pairs } = req.body;
    
    if (!pairs) {
      throw new ValidationError('Missing required parameters');
    }

    if (!Array.isArray(pairs)) {
      throw new ValidationError('pairs must be an array');
    }

    if (pairs.length === 0) {
      throw new ValidationError('Pairs array cannot be empty');
    }

    if (pairs.length > 100) {
      throw new ValidationError('Maximum 100 pairs allowed per request');
    }

    // Check for duplicate pairs
    const uniquePairs = new Set();
    for (const [i, pair] of pairs.entries()) {
      const { inputToken, outputToken } = pair;
      if (!inputToken || !outputToken) {
        throw new ValidationError('Missing required parameters');
      }
      if (!validateTokenAddress(inputToken)) {
        throw new ValidationError(`Invalid input token address format in pair ${i}`);
      }
      if (!validateTokenAddress(outputToken)) {
        throw new ValidationError(`Invalid output token address format in pair ${i}`);
      }
      const pairKey = `${inputToken}-${outputToken}`;
      if (uniquePairs.has(pairKey)) {
        throw new ValidationError('Duplicate pairs are not allowed');
      }
      uniquePairs.add(pairKey);
    }

    const result = await priceService.getPrices(pairs);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router; 