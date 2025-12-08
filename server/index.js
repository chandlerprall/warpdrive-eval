const express = require('express');
const cors = require('cors');
const store = require('./store');

// Import route modules
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const categoriesRouter = require('./routes/categories');
const tagsRouter = require('./routes/tags');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'WarpDrive API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      stats: '/stats',
      reset: 'POST /reset',
      users: '/api/users',
      posts: '/api/posts',
      categories: '/api/categories',
      tags: '/api/tags'
    },
    documentation: 'See README.md and api-plan.md for details'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Stats endpoint - show current data counts
app.get('/stats', (req, res) => {
  res.json({
    users: store.count('users'),
    posts: store.count('posts'),
    categories: store.count('categories'),
    tags: store.count('tags'),
    comments: store.count('comments'),
    likes: store.count('likes'),
    publishedPosts: store.count('posts', p => p.status === 'published'),
    draftPosts: store.count('posts', p => p.status === 'draft')
  });
});

// Reset endpoint (useful for testing)
app.post('/reset', (req, res) => {
  store.reset();
  res.json({ 
    message: 'Store reset to seed data',
    timestamp: new Date().toISOString() 
  });
});

// Mount API routes
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/tags', tagsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    errors: [{
      status: '404',
      title: 'Not Found',
      detail: `Endpoint '${req.method} ${req.path}' not found`
    }]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`📊 Stats available at http://localhost:${PORT}/stats`);
});
