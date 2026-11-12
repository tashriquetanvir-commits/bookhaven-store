import { Router } from 'express';
import Book from '../models/Book.js';
import { requireUser } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.q) {
      const term = String(req.query.q).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { author: { $regex: term, $options: 'i' } }
      ];
    }
    const books = await Book.find(filter).sort({ title: 1 }).limit(100);
    res.json({ books });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('reviews.user', 'name');
    if (!book) return res.status(404).json({ message: 'Book not found.' });
    res.json({ book });
  } catch (error) { next(error); }
});

router.post('/:id/reviews', requireUser, async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    const comment = req.body.comment?.trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) return res.status(400).json({ message: 'Choose a 1–5 rating and enter a comment.' });
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found.' });
    const alreadyReviewed = book.reviews.some(review => review.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(409).json({ message: 'You have already reviewed this book.' });
    book.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
    await book.save();
    res.status(201).json({ book });
  } catch (error) { next(error); }
});

export default router;
