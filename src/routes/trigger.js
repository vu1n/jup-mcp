import express from 'express';
import triggerService from '../services/trigger.js';

const router = express.Router();

// Create a new trigger order
router.post('/create', async (req, res) => {
  try {
    const { inputToken, outputToken, amount, triggerPrice, userPublicKey, triggerType, expiryDate } = req.body;
    if (!inputToken || !outputToken || !amount || !triggerPrice || !userPublicKey || !triggerType || !expiryDate) {
      return res.status(400).json({ status: 'error', message: 'Missing required parameters' });
    }
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(inputToken)) {
      return res.status(400).json({ status: 'error', message: 'Invalid input token address format' });
    }
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(outputToken)) {
      return res.status(400).json({ status: 'error', message: 'Invalid output token address format' });
    }
    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ status: 'error', message: 'Amount must be a positive number' });
    }
    if (isNaN(triggerPrice) || Number(triggerPrice) <= 0) {
      return res.status(400).json({ status: 'error', message: 'Trigger price must be a positive number' });
    }
    if (!['above', 'below'].includes(triggerType)) {
      return res.status(400).json({ status: 'error', message: 'Invalid trigger type. Must be one of: above, below' });
    }
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(userPublicKey)) {
      return res.status(400).json({ status: 'error', message: 'Invalid Solana public key format' });
    }
    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({ status: 'error', message: 'Expiry date must be in the future' });
    }
    const order = await triggerService.createTriggerOrder(
      inputToken,
      outputToken,
      amount,
      triggerPrice,
      userPublicKey,
      triggerType,
      expiryDate
    );
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get all trigger orders for a user
router.get('/list', async (req, res) => {
  try {
    const { userPublicKey, limit, offset, status } = req.query;
    if (!userPublicKey) {
      return res.status(400).json({ status: 'error', message: 'Missing user public key' });
    }
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(userPublicKey)) {
      return res.status(400).json({ status: 'error', message: 'Invalid Solana public key format' });
    }
    if ((limit && limit <= 0) || (offset && offset < 0)) {
      return res.status(400).json({ status: 'error', message: 'Limit and offset must be positive numbers' });
    }
    if (status && !['active', 'triggered', 'expired', 'cancelled'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status value. Must be one of: active, triggered, expired, cancelled' });
    }
    const orders = await triggerService.getTriggerOrders(userPublicKey, limit ? Number(limit) : undefined, offset ? Number(offset) : undefined, status);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Update a trigger order
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { triggerPrice, expiryDate } = req.body;
    if (!id) {
      return res.status(400).json({ status: 'error', message: 'Missing order ID' });
    }
    if (!triggerPrice && !expiryDate) {
      return res.status(400).json({ status: 'error', message: 'At least one update parameter (triggerPrice, expiryDate) must be provided' });
    }
    if (triggerPrice && (isNaN(triggerPrice) || Number(triggerPrice) <= 0)) {
      return res.status(400).json({ status: 'error', message: 'Trigger price must be a positive number' });
    }
    if (expiryDate && new Date(expiryDate) <= new Date()) {
      return res.status(400).json({ status: 'error', message: 'Expiry date must be in the future' });
    }
    const result = await triggerService.updateTriggerOrder(id, triggerPrice, expiryDate);
    if (!result) {
      return res.status(404).json({ status: 'error', message: 'Trigger order not found' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Cancel a trigger order
router.delete('/cancel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ status: 'error', message: 'Missing order ID' });
    }
    const result = await triggerService.cancelTriggerOrder(id);
    if (!result) {
      return res.status(404).json({ status: 'error', message: 'Trigger order not found' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router; 