// Food Delivery Backend Server
// Install dependencies: npm install express cors
// Run with: node backend-server.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Database
const restaurants = [
  {
    id: 1,
    name: "Sakura Sushi",
    cuisine: "Japanese",
    rating: 4.8,
    deliveryTime: "25-35 min",
    deliveryFee: 2.99,
    minOrder: 15,
    image: "🍣"
  },
  {
    id: 2,
    name: "Mama's Pizzeria",
    cuisine: "Italian",
    rating: 4.6,
    deliveryTime: "30-40 min",
    deliveryFee: 1.99,
    minOrder: 10,
    image: "🍕"
  },
  {
    id: 3,
    name: "Taco Fiesta",
    cuisine: "Mexican",
    rating: 4.7,
    deliveryTime: "20-30 min",
    deliveryFee: 2.49,
    minOrder: 12,
    image: "🌮"
  },
  {
    id: 4,
    name: "Green Bowl",
    cuisine: "Healthy",
    rating: 4.9,
    deliveryTime: "15-25 min",
    deliveryFee: 3.49,
    minOrder: 8,
    image: "🥗"
  },
  {
    id: 5,
    name: "Burger Palace",
    cuisine: "American",
    rating: 4.5,
    deliveryTime: "25-35 min",
    deliveryFee: 2.99,
    minOrder: 10,
    image: "🍔"
  },
  {
    id: 6,
    name: "Spice Route",
    cuisine: "Indian",
    rating: 4.8,
    deliveryTime: "35-45 min",
    deliveryFee: 2.49,
    minOrder: 15,
    image: "🍛"
  }
];

const menuItems = {
  1: [ // Sakura Sushi
    { id: 101, name: "California Roll", price: 12.99, description: "Crab, avocado, cucumber", category: "Rolls" },
    { id: 102, name: "Spicy Tuna Roll", price: 14.99, description: "Tuna, spicy mayo, cucumber", category: "Rolls" },
    { id: 103, name: "Salmon Nigiri", price: 8.99, description: "2 pieces of fresh salmon", category: "Nigiri" },
    { id: 104, name: "Miso Soup", price: 3.99, description: "Traditional soybean soup", category: "Sides" },
    { id: 105, name: "Edamame", price: 5.99, description: "Steamed soybeans with sea salt", category: "Sides" }
  ],
  2: [ // Mama's Pizzeria
    { id: 201, name: "Margherita Pizza", price: 13.99, description: "Tomato sauce, mozzarella, basil", category: "Pizza" },
    { id: 202, name: "Pepperoni Pizza", price: 15.99, description: "Classic pepperoni & cheese", category: "Pizza" },
    { id: 203, name: "Caesar Salad", price: 8.99, description: "Romaine, parmesan, croutons", category: "Salads" },
    { id: 204, name: "Garlic Bread", price: 5.99, description: "Toasted with garlic butter", category: "Sides" },
    { id: 205, name: "Tiramisu", price: 6.99, description: "Classic Italian dessert", category: "Desserts" }
  ],
  3: [ // Taco Fiesta
    { id: 301, name: "Carne Asada Tacos", price: 11.99, description: "3 tacos with grilled beef", category: "Tacos" },
    { id: 302, name: "Chicken Burrito", price: 10.99, description: "Rice, beans, cheese, chicken", category: "Burritos" },
    { id: 303, name: "Guacamole & Chips", price: 7.99, description: "Fresh avocado dip", category: "Appetizers" },
    { id: 304, name: "Quesadilla", price: 9.99, description: "Cheese & chicken", category: "Quesadillas" },
    { id: 305, name: "Churros", price: 5.99, description: "Cinnamon sugar churros", category: "Desserts" }
  ],
  4: [ // Green Bowl
    { id: 401, name: "Buddha Bowl", price: 13.99, description: "Quinoa, avocado, greens, tahini", category: "Bowls" },
    { id: 402, name: "Acai Bowl", price: 11.99, description: "Acai, granola, fresh berries", category: "Bowls" },
    { id: 403, name: "Green Smoothie", price: 7.99, description: "Spinach, banana, mango, almond milk", category: "Drinks" },
    { id: 404, name: "Avocado Toast", price: 9.99, description: "Sourdough, avocado, cherry tomatoes", category: "Breakfast" },
    { id: 405, name: "Chia Pudding", price: 6.99, description: "Coconut milk, chia seeds, berries", category: "Desserts" }
  ],
  5: [ // Burger Palace
    { id: 501, name: "Classic Burger", price: 11.99, description: "Beef patty, lettuce, tomato, cheese", category: "Burgers" },
    { id: 502, name: "Double Bacon Burger", price: 15.99, description: "Two patties, bacon, cheddar", category: "Burgers" },
    { id: 503, name: "Sweet Potato Fries", price: 5.99, description: "Crispy sweet potato fries", category: "Sides" },
    { id: 504, name: "Onion Rings", price: 6.99, description: "Beer-battered onion rings", category: "Sides" },
    { id: 505, name: "Milkshake", price: 5.99, description: "Vanilla, chocolate, or strawberry", category: "Drinks" }
  ],
  6: [ // Spice Route
    { id: 601, name: "Chicken Tikka Masala", price: 14.99, description: "Creamy tomato curry with chicken", category: "Curry" },
    { id: 602, name: "Vegetable Biryani", price: 12.99, description: "Fragrant rice with mixed vegetables", category: "Rice" },
    { id: 603, name: "Samosas", price: 6.99, description: "Crispy pastries with spiced potatoes", category: "Appetizers" },
    { id: 604, name: "Garlic Naan", price: 3.99, description: "Freshly baked flatbread", category: "Bread" },
    { id: 605, name: "Mango Lassi", price: 4.99, description: "Sweet yogurt drink", category: "Drinks" }
  ]
};

// In-memory order storage
let orders = [];
let orderIdCounter = 1000;

// API Endpoints

// Get all restaurants
app.get('/api/restaurants', (req, res) => {
  res.json(restaurants);
});

// Get restaurant by ID
app.get('/api/restaurants/:id', (req, res) => {
  const restaurant = restaurants.find(r => r.id === parseInt(req.params.id));
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  res.json(restaurant);
});

// Get menu items for a restaurant
app.get('/api/restaurants/:id/menu', (req, res) => {
  const restaurantId = parseInt(req.params.id);
  const restaurant = restaurants.find(r => r.id === restaurantId);
  
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  
  const menu = menuItems[restaurantId] || [];
  res.json({
    restaurant,
    menu
  });
});

// Create an order
app.post('/api/orders', (req, res) => {
  const { restaurantId, items, deliveryAddress, customerName, customerPhone, subtotal, deliveryFee, total } = req.body;
  
  if (!restaurantId || !items || items.length === 0) {
    return res.status(400).json({ error: 'Invalid order data' });
  }
  
  const order = {
    id: orderIdCounter++,
    restaurantId,
    items,
    deliveryAddress,
    customerName,
    customerPhone,
    subtotal,
    deliveryFee,
    total,
    status: 'pending',
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 30 * 60000).toISOString() // 30 minutes from now
  };
  
  orders.push(order);
  res.status(201).json(order);
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === parseInt(req.params.id));
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  order.status = status;
  res.json(order);
});

// Search restaurants
app.get('/api/search', (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.json(restaurants);
  }
  
  const results = restaurants.filter(r => 
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(query.toLowerCase())
  );
  
  res.json(results);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Food Delivery API Server running on http://localhost:${PORT}`);
  console.log(`📍 API Endpoints:
  - GET  /api/restaurants
  - GET  /api/restaurants/:id
  - GET  /api/restaurants/:id/menu
  - POST /api/orders
  - GET  /api/orders/:id
  - PATCH /api/orders/:id/status
  - GET  /api/search?query=...
  - GET  /api/health
  `);
});
