import express from 'express';
import priceService from '../services/price.js';
import { validateTokenAddress } from '../utils/validation.js';

const router = express.Router();

// Get single price
router.get('/:inputToken/:outputToken', async (req, res) => {
  try {
    const { inputToken, outputToken } = req.params;
    
    if (!validateTokenAddress(inputToken)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid input token address format'
      });
    }

    if (!validateTokenAddress(outputToken)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid output token address format'
      });
    }

    const result = await priceService.getPrice(inputToken, outputToken);
    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Price not available'
      });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get multiple prices
router.post('/batch', async (req, res) => {
  try {
    const { pairs } = req.body;
    
    if (!pairs) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters'
      });
    }

    if (!Array.isArray(pairs)) {
      return res.status(400).json({
        status: 'error',
        message: 'pairs must be an array'
      });
    }

    if (pairs.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Pairs array cannot be empty'
      });
    }

    if (pairs.length > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Maximum 100 pairs allowed per request'
      });
    }

    // Check for duplicate pairs
    const uniquePairs = new Set();
    for (const pair of pairs) {
      const pairKey = `${pair.inputToken}-${pair.outputToken}`;
      if (uniquePairs.has(pairKey)) {
        return res.status(400).json({
          status: 'error',
          message: 'Duplicate pairs are not allowed'
        });
      }
      uniquePairs.add(pairKey);
    }

    // Validate token addresses
    for (let i = 0; i < pairs.length; i++) {
      const { inputToken, outputToken } = pairs[i];
      if (!validateTokenAddress(inputToken)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid input token address format in pair ${i}`
        });
      }
      if (!validateTokenAddress(outputToken)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid output token address format in pair ${i}`
        });
      }
    }

    const result = await priceService.getPrices(pairs);
    res.json(result);
  } catch (error) {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request body format'
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Add error handler for invalid JSON
router.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request body format'
    });
  }
  next(err);
});

export default router; 