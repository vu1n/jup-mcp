import express from 'express';
import cors from 'cors';
import ultraRoutes from './routes/ultra.js';
import swapRoutes from './routes/swap.js';
import tokenRoutes from './routes/token.js';
import priceRoutes from './routes/price.js';
import triggerRoutes from './routes/trigger.js';
import recurringRoutes from './routes/recurring.js';
import { ValidationError, NotFoundError, UnauthorizedError, ServiceError } from './errors.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Handle JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request body format'
    });
  }
  next(err);
});

// Routes
app.use('/ultra', ultraRoutes);
app.use('/swap', swapRoutes);
app.use('/token', tokenRoutes);
app.use('/price', priceRoutes);
app.use('/trigger', triggerRoutes);
app.use('/recurring', recurringRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      status: 'error',
      message: err.message
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      status: 'error',
      message: err.message
    });
  }

  if (err instanceof ServiceError) {
    return res.status(err.status).json({
      status: 'error',
      message: err.message
    });
  }

  // Treat any other error as a ServiceError
  if (err instanceof Error) {
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Internal server error'
    });
  }

  // Default error handler
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
 