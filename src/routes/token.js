import express from 'express';
import tokenService from '../services/token.js';
import { validateTokenAddress } from '../utils/validation.js';
import { ValidationError, NotFoundError, ServiceError } from '../utils/errors.js';

const router = express.Router();

// Get token information
router.get('/info/:tokenAddress', async (req, res, next) => {
  try {
    const { tokenAddress } = req.params;
    
    if (!validateTokenAddress(tokenAddress)) {
      throw new ValidationError('Invalid token address format');
    }

    const result = await tokenService.getTokenInfo(tokenAddress);
    if (!result) {
      throw new NotFoundError('Token not found');
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Get token list
router.get('/list', async (req, res, next) => {
  try {
    const { limit = 10, offset = 0, search, tags, verified } = req.query;

    // Validate limit
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      throw new ValidationError('Limit and offset must be positive numbers');
    }
    if (parsedLimit > 1000) {
      throw new ValidationError('Maximum limit is 1000');
    }

    // Validate offset
    const parsedOffset = parseInt(offset);
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      throw new ValidationError('Limit and offset must be positive numbers');
    }

    // Validate search
    if (search !== undefined && typeof search !== 'string') {
      throw new ValidationError('Search parameter must be a string');
    }

    // Validate verified FIRST
    let parsedVerified;
    if (verified !== undefined) {
      if (verified === 'true') {
        parsedVerified = true;
      } else if (verified === 'false') {
        parsedVerified = false;
      } else if (typeof verified === 'boolean') {
        parsedVerified = verified;
      } else {
        // Throw immediately if verified is invalid
        throw new ValidationError('Verified must be a boolean');
      }
    }

    // Validate tags – must be an array if provided
    let parsedTags;
    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        throw new ValidationError('Tags must be an array');
      }
      parsedTags = tags;
    }

    // Call service with positional arguments
    const result = await tokenService.getTokenList(
      parsedLimit,
      parsedOffset,
      search,
      parsedTags,
      parsedVerified
    );

    // Always return 200 with the result (empty list allowed)
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ServiceError) {
      return next(error);
    }

    // Propagate original error message so that tests expecting specific text (e.g., "Service error") pass
    next(new ServiceError(error.message));
  }
});

export default router; 