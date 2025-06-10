import express from 'express';
import triggerService from '../services/trigger.js';
import { validateTokenAddress } from '../utils/validation.js';
import { ValidationError, NotFoundError, ServiceError } from '../utils/errors.js';

const router = express.Router();

// Create trigger order
router.post('/create', async (req, res, next) => {
  try {
    const { inputToken, outputToken, amount, triggerPrice, userPublicKey, triggerType, expiryDate } = req.body;

    if (!inputToken || !outputToken || !amount || !triggerPrice || !userPublicKey || !triggerType || !expiryDate) {
      throw new ValidationError('Missing required parameters');
    }

    if (!validateTokenAddress(inputToken)) {
      throw new ValidationError('Invalid input token address format');
    }

    if (!validateTokenAddress(outputToken)) {
      throw new ValidationError('Invalid output token address format');
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ValidationError('Amount must be a positive number');
    }

    if (isNaN(Number(triggerPrice)) || Number(triggerPrice) <= 0) {
      throw new ValidationError('Trigger price must be a positive number');
    }

    if (!['above', 'below'].includes(triggerType)) {
      throw new ValidationError('Invalid trigger type. Must be one of: above, below');
    }

    if (!validateTokenAddress(userPublicKey)) {
      throw new ValidationError('Invalid Solana public key format');
    }

    if (new Date(expiryDate) <= new Date()) {
      throw new ValidationError('Expiry date must be in the future');
    }

    const result = await triggerService.createTriggerOrder(
      inputToken,
      outputToken,
      amount,
      triggerPrice,
      triggerType,
      userPublicKey,
      expiryDate
    );

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    } else if (error instanceof ServiceError) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    } else {
      next(error);
    }
  }
});

// Get trigger orders
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

    if (status && !['active', 'triggered', 'expired', 'cancelled'].includes(status)) {
      throw new ValidationError('Invalid status value. Must be one of: active, triggered, expired, cancelled');
    }

    const result = await triggerService.getTriggerOrders(
      userPublicKey,
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
      status
    );

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    } else if (error instanceof ServiceError) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    } else {
      next(error);
    }
  }
});

// Update trigger order
router.put('/update', async (req, res, next) => {
  try {
    const { id, triggerPrice, expiryDate } = req.body;

    if (!id) {
      throw new ValidationError('Missing order ID');
    }

    if (triggerPrice === undefined && expiryDate === undefined) {
      throw new ValidationError('At least one update parameter (triggerPrice, expiryDate) must be provided');
    }

    if (triggerPrice !== undefined && (isNaN(Number(triggerPrice)) || Number(triggerPrice) <= 0)) {
      throw new ValidationError('Trigger price must be a positive number');
    }

    if (expiryDate !== undefined && new Date(expiryDate) <= new Date()) {
      throw new ValidationError('Expiry date must be in the future');
    }

    const result = await triggerService.updateTriggerOrder(id, triggerPrice, expiryDate);
    
    if (!result) {
      throw new NotFoundError('Trigger order not found');
    }

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    } else if (error instanceof NotFoundError) {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
    } else if (error instanceof ServiceError) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    } else {
      next(error);
    }
  }
});

// Cancel trigger order
router.delete('/cancel/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ValidationError('Missing order ID');
    }

    const result = await triggerService.cancelTriggerOrder(id);
    
    if (!result) {
      throw new NotFoundError('Trigger order not found');
    }

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    } else if (error instanceof NotFoundError) {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
    } else if (error instanceof ServiceError) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    } else {
      next(error);
    }
  }
});

export default router; 