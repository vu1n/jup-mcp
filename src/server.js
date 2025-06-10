import express from 'express';
import cors from 'cors';
import ultraRoutes from './routes/ultra.js';
import swapRoutes from './routes/swap.js';
import tokenRoutes from './routes/token.js';
import priceRoutes from './routes/price.js';
import triggerRoutes from './routes/trigger.js';
import recurringRoutes from './routes/recurring.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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
  res.status(500).json({
    error: 'Internal server error'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
 