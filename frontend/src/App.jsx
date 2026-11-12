import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, ShoppingBag, UserRound, Menu, X, ArrowRight, Star, Plus, Minus, Trash2, LogOut } from 'lucide-react';

const sampleBooks = [
  { _id: '1', title: 'The Paper Garden', author: 'Mira Sen', category: 'Fiction', description: 'A quiet story about family, memory, and the garden that brings a neighbourhood together.', price: 18.5, stock: 12, coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=80', reviews: [{ rating: 5 }, { rating: 4 }] },
  { _id: '2', title: 'Small Worlds, Big Ideas', author: 'Daniel Okafor', category: 'Science', description: 'Friendly introductions to the discoveries that changed how we understand the natural world.', price: 22, stock: 8, coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=700&q=80', reviews: [{ rating: 5 }] },
  { _id: '3', title: 'A Map of Elsewhere', author: 'Leah Morgan', category: 'Fantasy', description: 'A cartographer finds a hidden route between the city she knows and the world she imagined.', price: 16.99, stock: 15, coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80', reviews: [{ rating: 4 }, { rating: 5 }, { rating: 5 }] },
  { _id: '4', title: 'Build Better Habits', author: 'Samira Chowdhury', category: 'Personal Growth', description: 'Practical, small steps for making routines feel easier to start and simpler to keep.', price: 19.75, stock: 10, coverUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=700&q=80', reviews: [{ rating: 4 }] },
  { _id: '5', title: 'The Last Train Home', author: 'Oliver Reed', category: 'Mystery', description: 'A late-night journey, a missing passenger, and clues hidden in the stations along the line.', price: 14.5, stock: 6, coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=700&q=80', reviews: [{ rating: 5 }, { rating: 4 }] },
  { _id: '6', title: 'Kitchen Notes', author: 'Nadia Rahman', category: 'Food', description: 'Seasonal recipes and simple techniques for relaxed meals around the table.', price: 24, stock: 5, coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=700&q=80', reviews: [{ rating: 5 }] }
];
const categories = ['All books', 'Fiction', 'Fantasy', 'Mystery', 'Science', 'Personal Growth', 'Food'];
const tokenKey = 'bookhaven-token';

async function request(path, options = {}) {
  const token = localStorage.getItem(tokenKey);
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Request failed');
  return body;
}

function BookCard({ book, onAdd, onOpen }) {
  const rating = book.reviews?.length ? (book.reviews.reduce((sum, review) => sum + review.rating, 0) / book.reviews.length).toFixed(1) : 'New';
  return <article className="book-card">
    <button className="cover-button" onClick={() => onOpen(book)} aria-label={`View ${book.title}`}>
      <img className="book-cover" src={book.coverUrl} alt={`Cover of ${book.title}`} loading="lazy" />
      <span className="cover-tag">{book.category}</span>
    </button>
    <div className="book-info">
      <div className="book-rating"><Star size={13} fill="currentColor" /> <span>{rating}</span><span className="rating-count">{book.reviews?.length ? `(${book.reviews.length})` : ''}</span></div>
      <button className="book-title" onClick={() => onOpen(book)}>{book.title}</button>
      <p className="book-author">by {book.author}</p>
      <div className="book-buy"><span className="price">${Number(book.price).toFixed(2)}</span><button className="add-button" onClick={() => onAdd(book)} aria-label={`Add ${book.title} to basket`}><Plus size={17} /></button></div>
    </div>
  </article>;
}

export default function App() {
  const [books, setBooks] = useState(sampleBooks);
  const [category, setCategory] = useState('All books');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('bookhaven-cart') || '[]'));
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    request('/books').then(data => { if (data.books?.length) setBooks(data.books); }).catch(() => {});
    if (localStorage.getItem(tokenKey)) request('/auth/me').then(data => setUser(data.user)).catch(() => localStorage.removeItem(tokenKey));
  }, []);

  useEffect(() => {
    if (!user) return;
    request('/cart').then(data => setCart(data.items || [])).catch(() => {});
  }, [user]);

  useEffect(() => { localStorage.setItem('bookhaven-cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 2600); return () => clearTimeout(timer); }, [notice]);

  const visibleBooks = useMemo(() => books.filter(book => {
    const matchesCategory = category === 'All books' || book.category === category;
    const text = `${book.title} ${book.author}`.toLowerCase();
    return matchesCategory && text.includes(query.toLowerCase());
  }), [books, category, query]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * Number(item.book.price), 0);

  async function addToCart(book) {
    if (user) {
      try {
        await request(`/cart/${book._id}`, { method: 'POST' });
        const data = await request('/cart');
        setCart(data.items || []);
        setNotice(`${book.title} added to your basket`);
        return;
      } catch (error) { setNotice(error.message); return; }
    }
    setCart(items => {
      const existing = items.find(item => item.book._id === book._id);
      return existing ? items.map(item => item.book._id === book._id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { book, quantity: 1 }];
    });
    setNotice(`${book.title} added to your basket`);
  }
  async function changeQuantity(bookId, amount) {
    const current = cart.find(item => item.book._id === bookId);
    if (!current) return;
    const quantity = current.quantity + amount;
    if (user) {
      try {
        if (quantity < 1) await request(`/cart/${bookId}`, { method: 'DELETE' });
        else await request(`/cart/${bookId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) });
        const data = await request('/cart'); setCart(data.items || []);
      } catch (error) { setNotice(error.message); }
      return;
    }
    setCart(items => items.map(item => item.book._id === bookId ? { ...item, quantity } : item).filter(item => item.quantity > 0));
  }
  async function authenticate(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const action = modal.mode === 'register' ? '/auth/register' : '/auth/login';
    const payload = Object.fromEntries(form.entries());
    try {
      const data = await request(action, { method: 'POST', body: JSON.stringify(payload) });
      localStorage.setItem(tokenKey, data.token); setUser(data.user); setModal(null); setNotice(`Welcome, ${data.user.name}`);
    } catch (error) { setNotice(error.message); }
  }
  function signOut() { localStorage.removeItem(tokenKey); setUser(null); setNotice('You have signed out'); }

  return <div className="app-shell">
    <div className="topline"><span>Independent reads, delivered with care</span><span>Free shipping on orders over $40</span></div>
    <header className="site-header">
      <button className="icon-button mobile-menu-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu ? <X /> : <Menu />}</button>
      <a className="brand" href="#top" aria-label="BookHaven home"><span className="brand-mark"><BookOpen size={21} /></span><span>bookhaven<span className="brand-dot">.</span></span></a>
      <nav className={`main-nav ${mobileMenu ? 'nav-open' : ''}`}>
        <a className="nav-active" href="#catalog" onClick={() => setMobileMenu(false)}>Shop books</a><a href="#story" onClick={() => setMobileMenu(false)}>Our story</a><a href="#newsletter" onClick={() => setMobileMenu(false)}>Reading notes</a>
      </nav>
      <div className="header-actions">
        <button className="icon-button user-button" onClick={() => user ? signOut() : setModal({ mode: 'login' })} aria-label={user ? 'Sign out' : 'Sign in'}>{user ? <LogOut size={19} /> : <UserRound size={19} />}</button>
        <button className="basket-button" onClick={() => setModal({ mode: 'cart' })}><ShoppingBag size={18} /><span>Basket</span><b>{cartCount}</b></button>
      </div>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line" /> A little space for big stories</p><h1>Find your next<br /><em>good read.</em></h1><p className="hero-description">Thoughtful books for curious minds. Browse handpicked stories, fresh ideas, and old favourites.</p><a className="primary-button" href="#catalog">Explore the shelves <ArrowRight size={17} /></a><div className="hero-footnote"><div className="avatar-stack"><span>J</span><span>M</span><span>A</span></div><span>Loved by readers in 24 countries</span></div></div>
        <div className="hero-art"><div className="hero-circle" /><div className="hero-image"><img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1100&q=85" alt="Sunlit shelves in a cosy bookshop" /></div><div className="floating-note"><span className="note-star">✳</span><div><b>Stories stay with us.</b><small>Take one home today.</small></div></div><span className="hero-caption">THE SUNDAY READING ROOM · VOL. 01</span></div>
      </section>

      <section className="trust-strip"><div><span className="trust-icon">✳</span><span>Picked with care</span></div><div><span className="trust-icon">↗</span><span>Independent favourites</span></div><div><span className="trust-icon">♡</span><span>Made for slow browsing</span></div></section>

      <section className="catalog-section" id="catalog">
        <div className="section-heading"><div><p className="eyebrow">THE BOOKSHELF</p><h2>Stories for every <em>season.</em></h2></div><p className="section-aside">A growing collection of books worth<br />making room for.</p></div>
        <div className="catalog-tools"><div className="category-tabs">{categories.map(item => <button key={item} className={category === item ? 'category-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-box"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a title or author" /></label></div>
        <div className="book-grid">{visibleBooks.map(book => <BookCard key={book._id} book={book} onAdd={addToCart} onOpen={book => setModal({ mode: 'book', book })} />)}</div>
        {visibleBooks.length === 0 && <div className="empty-results"><BookOpen size={30} /><h3>No books found</h3><p>Try another title, author, or category.</p></div>}
        <div className="browse-more"><span>Showing {visibleBooks.length} books</span><span>New favourites added every month</span></div>
      </section>

      <section className="story-section" id="story"><div className="story-image"><img src="https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=1100&q=85" alt="Open book beside a cup of tea" /><span className="image-stamp">READ<br />SLOWLY</span></div><div className="story-copy"><p className="eyebrow">A NOTE FROM OUR BOOKSHOP</p><h2>Books make a<br />little room for <em>wonder.</em></h2><p>BookHaven began with one small shelf and a simple thought: finding a book should feel like finding a friend. We bring together stories that invite you to pause, learn, laugh, and see the world another way.</p><a href="#newsletter" className="text-link">A little more about us <ArrowRight size={16} /></a></div></section>

      <section className="newsletter-section" id="newsletter"><div className="newsletter-decoration">✳</div><p className="eyebrow">A LETTER FOR YOUR NEXT QUIET MOMENT</p><h2>Good books. <em>Good notes.</em></h2><p>Monthly recommendations and reading-room stories, delivered gently.</p><form onSubmit={event => { event.preventDefault(); setNotice('Thanks for joining our reading notes'); event.currentTarget.reset(); }}><input type="email" placeholder="Your email address" required /><button type="submit">Join the list <ArrowRight size={16} /></button></form><small>No spam, just a note when we have something lovely to share.</small></section>
    </main>

    <footer className="site-footer"><a className="brand footer-brand" href="#top"><span className="brand-mark"><BookOpen size={21} /></span><span>bookhaven<span className="brand-dot">.</span></span></a><span>Find a little wonder, one page at a time.</span><span>© 2026 BookHaven</span></footer>
    {notice && <div className="toast" role="status">{notice}</div>}
    {modal && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null); }}><section className={`modal-card ${modal.mode === 'cart' ? 'cart-modal' : ''}`} role="dialog" aria-modal="true">
      <button className="modal-close" onClick={() => setModal(null)} aria-label="Close"><X size={19} /></button>
      {modal.mode === 'login' || modal.mode === 'register' ? <><p className="eyebrow">YOUR READING ROOM</p><h2>{modal.mode === 'register' ? 'Create an account' : 'Welcome back'}</h2><p className="modal-subtitle">Save your basket and leave a note on books you love.</p><form className="auth-form" onSubmit={authenticate}>{modal.mode === 'register' && <label>Your name<input name="name" required minLength="2" /></label>}<label>Email address<input name="email" type="email" required /></label><label>Password<input name="password" type="password" minLength="8" required /></label><button className="primary-button" type="submit">{modal.mode === 'register' ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></button></form><button className="switch-auth" onClick={() => setModal({ mode: modal.mode === 'register' ? 'login' : 'register' })}>{modal.mode === 'register' ? 'Already have an account? Sign in' : 'New here? Create an account'}</button></> : null}
      {modal.mode === 'cart' ? <><p className="eyebrow">YOUR BASKET</p><h2>A few good reads.</h2>{cart.length ? <><div className="cart-items">{cart.map(item => <div className="cart-item" key={item.book._id}><img src={item.book.coverUrl} alt="" /><div className="cart-item-info"><b>{item.book.title}</b><small>{item.book.author}</small><strong>${(item.book.price * item.quantity).toFixed(2)}</strong></div><div className="quantity-control"><button aria-label="Reduce quantity" onClick={() => changeQuantity(item.book._id, -1)}><Minus size={13} /></button><span>{item.quantity}</span><button aria-label="Increase quantity" onClick={() => changeQuantity(item.book._id, 1)}><Plus size={13} /></button></div><button className="remove-item" aria-label="Remove book" onClick={() => setCart(items => items.filter(row => row.book._id !== item.book._id))}><Trash2 size={16} /></button></div>)}</div><div className="cart-total"><span>Subtotal</span><strong>${cartTotal.toFixed(2)}</strong></div><p className="cart-shipping">{cartTotal >= 40 ? 'Your order qualifies for free shipping.' : `$${(40 - cartTotal).toFixed(2)} away from free shipping.`}</p><button className="primary-button checkout-button" onClick={() => { if (!user) { setModal({ mode: 'login' }); setNotice('Sign in to continue with your basket'); } else setNotice('Checkout can be connected to a payment provider next.'); }}>Continue to checkout <ArrowRight size={16} /></button></> : <div className="empty-cart"><ShoppingBag size={30} /><p>Your basket is waiting for a good story.</p><button className="text-link" onClick={() => setModal(null)}>Browse the shelves <ArrowRight size={15} /></button></div>}</> : null}
      {modal.mode === 'book' && <><div className="detail-book"><img src={modal.book.coverUrl} alt={`Cover of ${modal.book.title}`} /><div><p className="eyebrow">{modal.book.category}</p><h2>{modal.book.title}</h2><p className="detail-author">by {modal.book.author}</p><p className="detail-description">{modal.book.description}</p><strong className="detail-price">${Number(modal.book.price).toFixed(2)}</strong><button className="primary-button" onClick={() => addToCart(modal.book)}>Add to basket <ShoppingBag size={16} /></button></div></div><div className="review-preview"><h3>Reader notes</h3>{modal.book.reviews?.length ? modal.book.reviews.map((review, index) => <p key={index}><span className="book-rating"><Star size={13} fill="currentColor" /> {review.rating}/5</span> A reader found something to love in this one.</p>) : <p>Be the first to leave a note on this book.</p>}<small>Sign in to add your own review.</small></div></>}
    </section></div>}
  </div>;
}
