import express from 'express';
import triggerService from '../services/trigger.js';

const router = express.Router();

// Create trigger order
router.post('/create', async (req, res) => {
  try {
    const { inputToken, outputToken, amount, triggerPrice, walletAddress } = req.body;
    if (!inputToken || !outputToken || !amount || !triggerPrice || !walletAddress) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters'
      });
    }
    const result = await triggerService.createTriggerOrder({
      inputToken,
      outputToken,
      amount,
      triggerPrice,
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

// Get trigger orders
router.get('/list/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const result = await triggerService.getTriggerOrders(walletAddress);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Cancel trigger order
router.post('/cancel/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await triggerService.cancelTriggerOrder(orderId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router; 