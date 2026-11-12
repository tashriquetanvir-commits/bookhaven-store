import { Router } from 'express';
import Book from '../models/Book.js';
import { requireUser, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireUser, requireAdmin);

router.post('/books', async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ book });
  } catch (error) { next(error); }
});

router.patch('/books/:id', async (req, res, next) => {
  try {
    const allowed = ['title', 'author', 'category', 'description', 'price', 'coverUrl', 'stock'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const book = await Book.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ message: 'Book not found.' });
    res.json({ book });
  } catch (error) { next(error); }
});

router.delete('/books/:id', async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found.' });
    res.json({ message: 'Book removed.' });
  } catch (error) { next(error); }
});

export default router;
