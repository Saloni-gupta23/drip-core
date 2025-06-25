// server.js
// This is the main file for our Node.js backend.
// It uses the Express framework to create a simple web server.

const express = require('express');
const cors = require('cors');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3001; // Use port 3001 for the backend

// === Middleware ===
// Middleware are functions that run for every request.

// 1. CORS (Cross-Origin Resource Sharing)
// This is crucial for allowing our Next.js frontend (running on a different port)
// to make requests to this backend.
app.use(cors());

// 2. JSON Body Parser
// This allows our server to understand and process incoming request bodies in JSON format.
app.use(express.json());


// === Mock Data ===
// In a real application, this data would come from our PostgreSQL database.
// For this initial step, we'll use a simple array of objects.
const mockProducts = [
  {
    id: 'p1',
    name: 'Classic Leather Wallet',
    description: 'A timeless bifold wallet made from genuine leather.',
    price: 75.00,
    imageUrl: 'https://placehold.co/600x400/5a4a3a/ffffff?text=Leather+Wallet',
    stock: 25,
  },
  {
    id: 'p2',
    name: 'Modern Smartwatch',
    description: 'Stay connected with this sleek and feature-rich smartwatch.',
    price: 299.99,
    imageUrl: 'https://placehold.co/600x400/333333/ffffff?text=Smartwatch',
    stock: 15,
  },
  {
    id: 'p3',
    name: 'Insulated Coffee Mug',
    description: 'Keeps your coffee hot for hours. 16 oz capacity.',
    price: 25.50,
    imageUrl: 'https://placehold.co/600x400/4d7c9e/ffffff?text=Coffee+Mug',
    stock: 50,
  },
  {
    id: 'p4',
    name: 'Wireless Bluetooth Headphones',
    description: 'Immersive sound quality with noise-cancellation.',
    price: 149.00,
    imageUrl: 'https://placehold.co/600x400/1a1a1a/ffffff?text=Headphones',
    stock: 30,
  },
];


// === API Routes ===
// Routes define the different endpoints our server will respond to.

// Health Check Route
// A simple route to check if the server is running.
app.get('/', (req, res) => {
  res.send('E-commerce backend server is running!');
});

// GET /api/products
// This endpoint will return our list of products.
app.get('/api/products', (req, res) => {
  console.log('Request received for /api/products');
  // We send the mockProducts array as a JSON response.
  // The 200 status code means "OK".
  res.status(200).json(mockProducts);
});

// GET /api/products/:id
// This endpoint will return a single product by its ID.
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const product = mockProducts.find(p => p.id === productId);

    if (product) {
        res.status(200).json(product);
    } else {
        // If no product is found, we send a 404 "Not Found" status.
        res.status(404).json({ message: 'Product not found' });
    }
});


// === Start the Server ===
// This command starts the server and makes it listen for incoming requests on the specified port.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

