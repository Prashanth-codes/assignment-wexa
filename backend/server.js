require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001', process.env.FRONTEND_URL],
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'StockFlow API running' }));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`StockFlow API running on port ${PORT}`));