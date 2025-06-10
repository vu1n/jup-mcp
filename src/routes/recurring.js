import express from 'express';
import recurringService from '../services/recurring.js';
import { validateTokenAddress } from '../utils/validation.js';
import { ValidationError, NotFoundError, ServiceError } from '../utils/errors.js';

const router = express.Router();

// Valid frequency values
const VALID_FREQUENCIES = ['daily', 'weekly', 'monthly'];

// Create a new recurring payment
router.post('/create', async (req, res, next) => {
  try {
    const {
      inputToken,
      outputToken,
      amount,
      frequency,
      startDate,
      endDate,
      userPublicKey,
    } = req.body;

    // Basic presence check
    if (!inputToken || !outputToken || !amount || !frequency || !startDate || !endDate || !userPublicKey) {
      throw new ValidationError('Missing required parameters');
    }

    // Address validation
    if (!validateTokenAddress(inputToken)) {
      throw new ValidationError('Invalid input token address format');
    }

    if (!validateTokenAddress(outputToken)) {
      throw new ValidationError('Invalid output token address format');
    }

    if (!validateTokenAddress(userPublicKey)) {
      throw new ValidationError('Invalid Solana public key format');
    }

    // Amount
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ValidationError('Amount must be a positive number');
    }

    // Frequency
    if (!VALID_FREQUENCIES.includes(frequency)) {
      throw new ValidationError(`Invalid frequency value. Must be one of: ${VALID_FREQUENCIES.join(', ')}`);
    }

    // Date checks
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError('Invalid date format');
    }
    if (start >= end) {
      throw new ValidationError('Start date must be before end date');
    }

    const result = await recurringService.createRecurringPayment(
      inputToken,
      outputToken,
      amount,
      frequency,
      startDate,
      endDate,
      userPublicKey
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Get all recurring payments for a user
router.get('/list', async (req, res, next) => {
  try {
    const { userPublicKey, limit, offset, status } = req.query;

    if (!userPublicKey) {
      throw new ValidationError('Missing user public key');
    }

    if (!validateTokenAddress(userPublicKey)) {
      throw new ValidationError('Invalid Solana public key format');
    }

    if ((limit && limit <= 0) || (offset && offset < 0)) {
      throw new ValidationError('Limit and offset must be positive numbers');
    }

    if (status && !['active', 'completed', 'cancelled'].includes(status)) {
      throw new ValidationError('Invalid status value. Must be one of: active, completed, cancelled');
    }

    const result = await recurringService.getRecurringPayments(
      userPublicKey,
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
      status
    );

    if (!result) {
      // If service returns null treat as not found so tests can expect 404
      throw new NotFoundError('No recurring payments found');
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Update a recurring payment
router.put('/update', async (req, res, next) => {
  try {
    const { id, amount, frequency, endDate } = req.body;
    if (!id) {
      throw new ValidationError('Missing payment ID');
    }
    if (amount === undefined && frequency === undefined && endDate === undefined) {
      throw new ValidationError('At least one update parameter (amount, frequency, endDate) must be provided');
    }
    if (amount !== undefined && (isNaN(Number(amount)) || Number(amount) <= 0)) {
      throw new ValidationError('Amount must be a positive number');
    }
    if (frequency !== undefined && !VALID_FREQUENCIES.includes(frequency)) {
      throw new ValidationError(`Invalid frequency value. Must be one of: ${VALID_FREQUENCIES.join(', ')}`);
    }
    if (endDate !== undefined && new Date(endDate) <= new Date()) {
      throw new ValidationError('End date must be in the future');
    }
    const result = await recurringService.updateRecurringPayment(id, amount, frequency, endDate);
    if (!result) {
      throw new NotFoundError('Recurring payment not found');
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Cancel recurring payment
router.delete('/cancel/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError('Missing payment ID');
    }
    const result = await recurringService.cancelRecurringPayment(id);
    if (!result) {
      throw new NotFoundError('Recurring payment not found');
    }
    res.json(result);
  } catch (error) {
    next(error);
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

// Map known errors to proper HTTP status so tests can assert on them.
router.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ status: 'error', message: err.message });
  }
  if (err instanceof ServiceError) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
  return res.status(500).json({ status: 'error', message: err.message || 'Internal server error' });
});

export default router; 