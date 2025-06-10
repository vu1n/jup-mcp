import express from 'express';
import priceService from '../services/price.js';

const router = express.Router();

// Get single price
router.get('/', async (req, res) => {
  try {
    const { tokenA, tokenB } = req.query;
    if (!tokenA || !tokenB) {
      return res.status(400).json({
        status: 'error',
        message: 'Both tokenA and tokenB are required'
      });
    }
    const result = await priceService.getPrice(tokenA, tokenB);
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
    if (!Array.isArray(pairs)) {
      return res.status(400).json({
        status: 'error',
        message: 'pairs must be an array'
      });
    }
    const result = await priceService.getPrices(pairs);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router; 