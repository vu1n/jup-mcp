import express from 'express';
import ultraService from '../services/ultra.js';

const router = express.Router();

// Get quote
router.post('/quote', async (req, res) => {
  try {
    const { inputToken, outputToken, amount, slippage = 1 } = req.body;
    
    // Validate required parameters
    if (!inputToken || !outputToken || !amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: inputToken, outputToken, and amount are required'
      });
    }

    // Validate amount is a positive number
    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Amount must be a positive number'
      });
    }

    // Validate slippage is a number between 0 and 100
    if (isNaN(slippage) || slippage < 0 || slippage > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Slippage must be a number between 0 and 100'
      });
    }

    // Validate inputToken format
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(inputToken)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid input token address format'
      });
    }

    // Validate outputToken format
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(outputToken)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid output token address format'
      });
    }

    const result = await ultraService.getQuote(inputToken, outputToken, amount, slippage);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Execute swap
router.post('/swap', async (req, res) => {
  try {
    const { 
      inputToken, 
      outputToken, 
      amount, 
      slippage = 1,
      userPublicKey,
      wrapUnwrapSOL = true 
    } = req.body;
    
    // Validate required parameters
    if (!inputToken || !outputToken || !amount || !userPublicKey) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: inputToken, outputToken, amount, and userPublicKey are required'
      });
    }

    // Validate amount is a positive number
    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Amount must be a positive number'
      });
    }

    // Validate slippage is a number between 0 and 100
    if (isNaN(slippage) || slippage < 0 || slippage > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Slippage must be a number between 0 and 100'
      });
    }

    // Validate userPublicKey is a valid Solana public key
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(userPublicKey)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Solana public key format'
      });
    }

    // Validate inputToken format
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(inputToken)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid input token address format'
      });
    }

    // Validate outputToken format
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(outputToken)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid output token address format'
      });
    }

    const result = await ultraService.executeSwap(
      inputToken,
      outputToken,
      amount,
      slippage,
      userPublicKey,
      wrapUnwrapSOL
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get swap history
router.get('/history', async (req, res) => {
  try {
    const { userPublicKey, limit = 10, offset = 0 } = req.query;
    
    // Validate required parameters
    if (!userPublicKey) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameter: userPublicKey'
      });
    }

    // Validate userPublicKey is a valid Solana public key
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(userPublicKey)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Solana public key format'
      });
    }

    // Validate limit and offset are positive numbers
    if (isNaN(limit) || Number(limit) < 0 || isNaN(offset) || Number(offset) < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Limit and offset must be positive numbers'
      });
    }

    const history = await ultraService.getSwapHistory(userPublicKey, Number(limit), Number(offset));
    res.json(history);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get swap status
router.get('/status/:swapId', async (req, res) => {
  try {
    const { swapId } = req.params;
    
    // Validate required parameters
    if (!swapId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameter: swapId'
      });
    }

    const status = await ultraService.getSwapStatus(swapId);
    if (!status) {
      return res.status(404).json({
        status: 'error',
        message: 'Swap not found'
      });
    }
    res.json(status);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router; 