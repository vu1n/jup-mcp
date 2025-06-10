import express from 'express';
import tokenService from '../services/token.js';
import { validateTokenAddress } from '../utils/validation.js';

const router = express.Router();

// Get token information
router.get('/info/:tokenAddress', async (req, res) => {
  try {
    const { tokenAddress } = req.params;
    
    if (!validateTokenAddress(tokenAddress)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid token address format'
      });
    }

    const result = await tokenService.getTokenInfo(tokenAddress);
    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Token not found'
      });
    }
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
    let { limit = 10, offset = 0, search, tags, verified } = req.query;

    // Parse limit and offset
    const parsedLimit = parseInt(limit);
    const parsedOffset = parseInt(offset);
    if (isNaN(parsedLimit) || isNaN(parsedOffset) || parsedLimit < 0 || parsedOffset < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Limit and offset must be positive numbers'
      });
    }
    if (parsedLimit > 1000) {
      return res.status(400).json({
        status: 'error',
        message: 'Maximum limit is 1000'
      });
    }

    // Parse tags as array if present
    if (tags !== undefined) {
      if (typeof tags === 'string') {
        // If it's a single string and not a JSON array, reject
        if (!tags.startsWith('[')) {
          return res.status(400).json({
            status: 'error',
            message: 'Tags must be an array'
          });
        }
        try {
          tags = JSON.parse(tags);
        } catch {
          return res.status(400).json({
            status: 'error',
            message: 'Tags must be an array'
          });
        }
      }
      if (!Array.isArray(tags)) {
        return res.status(400).json({
          status: 'error',
          message: 'Tags must be an array'
        });
      }
    }

    // Validate search parameter
    if (search !== undefined && typeof search !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Search parameter must be a string'
      });
    }

    // Parse verified as boolean if present
    if (verified !== undefined) {
      if (typeof verified === 'string') {
        if (verified !== 'true' && verified !== 'false') {
          return res.status(400).json({
            status: 'error',
            message: 'Verified must be a boolean'
          });
        }
        verified = verified === 'true';
      } else if (typeof verified !== 'boolean') {
        return res.status(400).json({
          status: 'error',
          message: 'Verified must be a boolean'
        });
      }
    }

    const result = await tokenService.getTokenList(
      parsedLimit,
      parsedOffset,
      search,
      tags,
      verified
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router; 