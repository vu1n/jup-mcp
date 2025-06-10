import express from 'express';
import tokenService from '../services/token.js';

const router = express.Router();

// Get token information
router.get('/info/:tokenAddress', async (req, res) => {
  try {
    const { tokenAddress } = req.params;
    const result = await tokenService.getTokenInfo(tokenAddress);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get token list
router.get('/list', async (req, res) => {
  try {
    const { tags, search } = req.query;
    const result = await tokenService.getTokenList({ tags, search });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router; 