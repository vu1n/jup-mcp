import express from 'express';
import triggerService from '../services/trigger.js';

const router = express.Router();

// Create a new trigger order
router.post('/create', async (req, res) => {
  try {
    const { inputToken, outputToken, amount, triggerPrice, walletAddress } = req.body;
    
    if (!inputToken || !outputToken || !amount || !triggerPrice || !walletAddress) {
      return res.status(400).json({
        error: 'Missing required parameters'
      });
    }

    const order = await triggerService.createTriggerOrder({
      inputToken,
      outputToken,
      amount,
      triggerPrice,
      walletAddress
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Get all trigger orders for a wallet
router.get('/list/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json({
        error: 'Missing wallet address'
      });
    }

    const orders = await triggerService.getTriggerOrders(walletAddress);
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Cancel a trigger order
router.post('/cancel', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        error: 'Missing order ID'
      });
    }

    const result = await triggerService.cancelTriggerOrder(orderId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

export default router; 