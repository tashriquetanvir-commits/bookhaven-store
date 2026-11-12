import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import cartRoutes from './routes/cart.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', name: 'BookHaven API' }));
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use((req, res) => res.status(404).json({ message: `No route for ${req.method} ${req.path}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier.' });
  if (error.code === 11000) return res.status(409).json({ message: 'That value is already in use.' });
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const port = Number(process.env.PORT) || 5000;
connectDatabase().then(() => app.listen(port, () => console.log(`BookHaven API listening on ${port}`)))
  .catch(error => { console.error(error.message); process.exit(1); });
