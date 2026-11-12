import { Router } from 'express';
import Book from '../models/Book.js';
import { requireUser } from '../middleware/auth.js';

const router = Router();
router.use(requireUser);

router.get('/', async (req, res, next) => {
  try {
    await req.user.populate('cart.book', 'title author price coverUrl stock');
    res.json({ items: req.user.cart.filter(item => item.book) });
  } catch (error) { next(error); }
});

router.post('/:bookId', async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found.' });
    if (book.stock < 1) return res.status(409).json({ message: 'This book is out of stock.' });
    const item = req.user.cart.find(entry => entry.book.toString() === book._id.toString());
    if (item) item.quantity += 1;
    else req.user.cart.push({ book: book._id, quantity: 1 });
    await req.user.save();
    res.status(201).json({ message: 'Added to your basket.' });
  } catch (error) { next(error); }
});

router.patch('/:bookId', async (req, res, next) => {
  try {
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: 'Quantity must be a positive whole number.' });
    const item = req.user.cart.find(entry => entry.book.toString() === req.params.bookId);
    if (!item) return res.status(404).json({ message: 'That book is not in your basket.' });
    item.quantity = quantity;
    await req.user.save();
    res.json({ message: 'Basket updated.' });
  } catch (error) { next(error); }
});

router.delete('/:bookId', async (req, res, next) => {
  try {
    req.user.cart = req.user.cart.filter(item => item.book.toString() !== req.params.bookId);
    await req.user.save();
    res.json({ message: 'Removed from your basket.' });
  } catch (error) { next(error); }
});

export default router;
