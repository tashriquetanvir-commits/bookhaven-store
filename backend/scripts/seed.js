import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import Book from '../models/Book.js';

const books = [
  { title: 'The Paper Garden', author: 'Mira Sen', category: 'Fiction', description: 'A quiet story about family, memory, and the garden that brings a neighbourhood together.', price: 18.5, stock: 12, coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=80' },
  { title: 'Small Worlds, Big Ideas', author: 'Daniel Okafor', category: 'Science', description: 'Friendly introductions to the discoveries that changed how we understand the natural world.', price: 22, stock: 8, coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=700&q=80' },
  { title: 'A Map of Elsewhere', author: 'Leah Morgan', category: 'Fantasy', description: 'A cartographer finds a hidden route between the city she knows and the world she imagined.', price: 16.99, stock: 15, coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80' },
  { title: 'Build Better Habits', author: 'Samira Chowdhury', category: 'Personal Growth', description: 'Practical, small steps for making routines feel easier to start and simpler to keep.', price: 19.75, stock: 10, coverUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=700&q=80' },
  { title: 'The Last Train Home', author: 'Oliver Reed', category: 'Mystery', description: 'A late-night journey, a missing passenger, and clues hidden in the stations along the line.', price: 14.5, stock: 6, coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=700&q=80' },
  { title: 'Kitchen Notes', author: 'Nadia Rahman', category: 'Food', description: 'Seasonal recipes and simple techniques for relaxed meals around the table.', price: 24, stock: 5, coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=700&q=80' }
];

try {
  await connectDatabase();
  const existingCount = await Book.countDocuments();
  if (existingCount) {
    console.log(`Database already has ${existingCount} books; leaving them unchanged.`);
  } else {
    await Book.insertMany(books);
    console.log(`Added ${books.length} sample books.`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
