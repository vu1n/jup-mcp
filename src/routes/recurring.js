import express from 'express';
import recurringService from '../services/recurring.js';

const router = express.Router();

// Valid frequency values
const VALID_FREQUENCIES = ['daily', 'weekly', 'monthly'];

// Create a new recurring payment
router.post('/create', async (req, res) => {
  try {
    const { inputToken, outputToken, amount, frequency, userPublicKey, startDate, endDate } = req.body;
    // Validate required parameters
    if (!inputToken || !outputToken || !amount || !frequency || !userPublicKey || !startDate || !endDate) {
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
    if (!VALID_FREQUENCIES.includes(frequency)) {
      return res.status(400).json({ status: 'error', message: `Invalid frequency value. Must be one of: ${VALID_FREQUENCIES.join(', ')}` });
    }
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(userPublicKey)) {
      return res.status(400).json({ status: 'error', message: 'Invalid Solana public key format' });
    }
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ status: 'error', message: 'Start date must be before end date' });
    }
    const payment = await recurringService.createRecurringPayment(
      inputToken,
      outputToken,
      amount,
      frequency,
      userPublicKey,
      startDate,
      endDate
    );
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get all recurring payments for a user
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
    if (status && !['active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status value. Must be one of: active, completed, cancelled' });
    }
    const payments = await recurringService.getRecurringPayments(userPublicKey, limit ? Number(limit) : undefined, offset ? Number(offset) : undefined, status);
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Update a recurring payment
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, frequency, endDate } = req.body;
    if (!id) {
      return res.status(400).json({ status: 'error', message: 'Missing payment ID' });
    }
    if (!amount && !frequency && !endDate) {
      return res.status(400).json({ status: 'error', message: 'At least one update parameter (amount, frequency, endDate) must be provided' });
    }
    if (amount && (isNaN(amount) || Number(amount) <= 0)) {
      return res.status(400).json({ status: 'error', message: 'Amount must be a positive number' });
    }
    if (frequency && !VALID_FREQUENCIES.includes(frequency)) {
      return res.status(400).json({ status: 'error', message: `Invalid frequency value. Must be one of: ${VALID_FREQUENCIES.join(', ')}` });
    }
    if (endDate && new Date(endDate) <= new Date()) {
      return res.status(400).json({ status: 'error', message: 'End date must be in the future' });
    }
    const result = await recurringService.updateRecurringPayment(id, amount, frequency, endDate);
    if (!result) {
      return res.status(404).json({ status: 'error', message: 'Recurring payment not found' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Cancel a recurring payment
router.delete('/cancel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ status: 'error', message: 'Missing payment ID' });
    }
    const result = await recurringService.cancelRecurringPayment(id);
    if (!result) {
      return res.status(404).json({ status: 'error', message: 'Recurring payment not found' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router; 