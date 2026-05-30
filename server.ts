/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { 
  BusinessConfig, 
  Category, 
  FoodItem, 
  Order, 
  HeroBanner 
} from './src/types';

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '50mb' }));

// Directories
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploads folder static files
app.use('/uploads', express.static(UPLOADS_DIR));

// Seed default databases
const defaultBusiness: BusinessConfig = {
  name: "Basak Khana Khajana",
  logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop",
  contactPhones: ["+91-9475476265", "+91-9800416889"],
  address: "Hansquea, Dulur chhat, P.O-Tarbanda, Dist-Darjeeling, Pin-734014",
  locationDetails: "Hansquea cross roads, Dulur chhat",
  mapIframeUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14251.27581452179!2d88.243555!3d26.685511!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDQxJzA3LjgiTiA4OMKwMTQnMzYuOCJF!5e0!3m2!1sen!2sin!4v1622340576391!5m2!1sen!2sin",
  aboutUsText: "Welcome to Basak Khana Khajana. We serve mouth-watering traditional Bengali foods, premium fastfoods, and freshly brewed Darjeeling tea. Owned and operated locally at Hansquea, Dulur chhat, Darjeeling. We guarantee absolute culinary happiness!"
};

const defaultCategories: Category[] = [
  { id: "breakfast", name: "Breakfast" },
  { id: "lunch", name: "Lunch" },
  { id: "fastfood", name: "Fastfood" },
  { id: "dinner", name: "Dinner" },
  { id: "tea", name: "Tea & Snacks" }
];

const defaultItems: FoodItem[] = [
  {
    id: "item_1",
    name: "Luchi Alur Dom",
    category: "Breakfast",
    price: 40,
    stock: 50,
    description: "4 pieces of hot golden luchis served with delectable spiced potato curry.",
    photoUrl: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500&auto=format&fit=crop"
  },
  {
    id: "item_2",
    name: "Aloo Paratha with Curd",
    category: "Breakfast",
    price: 60,
    stock: 30,
    description: "Whole wheat flatbread stuffed with spiced potatoes, served with fresh yoghurt.",
    photoUrl: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop"
  },
  {
    id: "item_3",
    name: "Special Chicken Biryani",
    category: "Lunch",
    price: 180,
    stock: 60,
    description: "Aromatic Basmati rice layers with tender masala chicken, roasted potato, and boiled egg.",
    photoUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop"
  },
  {
    id: "item_4",
    name: "Bengali Fish Meal",
    category: "Lunch",
    price: 150,
    stock: 40,
    description: "Steam rice, golden moong dal, seasonal veg bhaji, and authentic Katla Macher Jhal.",
    photoUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop"
  },
  {
    id: "item_5",
    name: "Darjeeling Steam Momo (8 pcs)",
    category: "Fastfood",
    price: 60,
    stock: 120,
    description: "Thin-wrapper dumplings filled with spiced juicy minced chicken meat, served with hot spicy soup.",
    photoUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop"
  },
  {
    id: "item_6",
    name: "Egg Stir-Fried Chowmein",
    category: "Fastfood",
    price: 80,
    stock: 80,
    description: "Wok-style tossed street noodles with eggs, onions, green chillies, and Indian spices.",
    photoUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop"
  },
  {
    id: "item_7",
    name: "Butter Naan with Butter Chicken",
    category: "Dinner",
    price: 190,
    stock: 45,
    description: "2 soft clay oven Naans loaded with butter and served with creamy rich boneless Butter Chicken.",
    photoUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop"
  },
  {
    id: "item_8",
    name: "Chilli Paneer with Fried Rice",
    category: "Dinner",
    price: 160,
    stock: 40,
    description: "Savoury and spicy Chilli paneer cubes served along with delicious egg/veg wok fried rice.",
    photoUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop"
  },
  {
    id: "item_9",
    name: "Premium Darjeeling Milk Tea",
    category: "Tea & Snacks",
    price: 15,
    stock: 250,
    description: "Special robust aromatic tea prepared from authentic local plantation handpicked leaves.",
    photoUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop"
  },
  {
    id: "item_10",
    name: "Veg Samosa (Singara - 2 pcs)",
    category: "Tea & Snacks",
    price: 20,
    stock: 100,
    description: "Crispy triangular pastry stuffed with tempered spiced potatoes and green peas.",
    photoUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4bc78?w=500&auto=format&fit=crop"
  }
];

const defaultHeroBanners: HeroBanner[] = [
  {
    id: "hero_1",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop",
    title: "Mouth-Watering Delicacies"
  },
  {
    id: "hero_2",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop",
    title: "Hygenic and Authentic Bengali Kitchen"
  },
  {
    id: "hero_3",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop",
    title: "Best Food treasury in Dulur chhat, Darjeeling"
  }
];

interface DataSchema {
  business: BusinessConfig;
  categories: Category[];
  items: FoodItem[];
  orders: Order[];
  heroBanners: HeroBanner[];
}

function readDb(): DataSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb({
        business: defaultBusiness,
        categories: defaultCategories,
        items: defaultItems,
        orders: [],
        heroBanners: defaultHeroBanners
      });
      return readDb();
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading db.json, returning defaults", err);
    return {
      business: defaultBusiness,
      categories: defaultCategories,
      items: defaultItems,
      orders: [],
      heroBanners: defaultHeroBanners
    };
  }
}

function writeDb(data: DataSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing db.json", err);
  }
}

// Admin tokens map
const ADMIN_TOKEN = "bkk_admin_secure_token_abc123";

// Security Authorization Middleware
const adminAuthMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ error: "Access denied. Admin credentials invalid or missing." });
  }
  next();
};

// --- API ENDPOINTS ---

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  // Let's support sujanbasakbkk@gmail.com and sujan/bkkadmin configs
  if ((username === 'admin' || username === 'sujanbasakbkk@gmail.com') && (password === 'admin123' || password === '9800416889')) {
    res.json({ success: true, token: ADMIN_TOKEN, username });
  } else {
    res.status(401).json({ success: false, error: "Invalid username or password" });
  }
});

// GET Business Setup
app.get('/api/business', (req, res) => {
  const dbData = readDb();
  res.json(dbData.business);
});

// Update Business Setup
app.post('/api/business', adminAuthMiddleware, (req, res) => {
  const dbData = readDb();
  dbData.business = { ...dbData.business, ...req.body };
  writeDb(dbData);
  res.json({ success: true, business: dbData.business });
});

// GET Categories
app.get('/api/categories', (req, res) => {
  const dbData = readDb();
  res.json(dbData.categories);
});

// Save/Update Categories list
app.post('/api/categories', adminAuthMiddleware, (req, res) => {
  const dbData = readDb();
  dbData.categories = req.body;
  writeDb(dbData);
  res.json({ success: true, categories: dbData.categories });
});

// GET Food Items
app.get('/api/items', (req, res) => {
  const dbData = readDb();
  res.json(dbData.items);
});

// Save New Food Item
app.post('/api/items', adminAuthMiddleware, (req, res) => {
  const dbData = readDb();
  const newItem: FoodItem = {
    id: `item_${Date.now()}`,
    name: req.body.name,
    category: req.body.category,
    price: Number(req.body.price),
    stock: Number(req.body.stock) || 0,
    description: req.body.description || '',
    photoUrl: req.body.photoUrl || ''
  };
  dbData.items.push(newItem);
  writeDb(dbData);
  res.json({ success: true, item: newItem });
});

// Update Food Item
app.put('/api/items/:id', adminAuthMiddleware, (req, res) => {
  const dbData = readDb();
  const index = dbData.items.findIndex(item => item.id === req.params.id);
  if (index !== -1) {
    dbData.items[index] = {
      ...dbData.items[index],
      ...req.body,
      id: req.params.id, // keep steady ID
      price: Number(req.body.price),
      stock: Number(req.body.stock)
    };
    writeDb(dbData);
    res.json({ success: true, item: dbData.items[index] });
  } else {
    res.status(404).json({ error: "Item not found" });
  }
});

// Delete Food Item
app.delete('/api/items/:id', adminAuthMiddleware, (req, res) => {
  const dbData = readDb();
  const index = dbData.items.findIndex(item => item.id === req.params.id);
  if (index !== -1) {
    dbData.items.splice(index, 1);
    writeDb(dbData);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Item not found" });
  }
});

// GET Hero Banners
app.get('/api/hero', (req, res) => {
  const dbData = readDb();
  res.json(dbData.heroBanners);
});

// Save Hero Banners
app.post('/api/hero', adminAuthMiddleware, (req, res) => {
  const dbData = readDb();
  dbData.heroBanners = req.body;
  writeDb(dbData);
  res.json({ success: true, heroBanners: dbData.heroBanners });
});

// GET Orders
app.get('/api/orders', (req, res) => {
  const dbData = readDb();
  res.json(dbData.orders);
});

// Submit customer order
app.post('/api/orders', (req, res) => {
  const dbData = readDb();
  const { customerName, phone, items, totalAmount } = req.body;

  // Generate Serial Token Number
  const today = new Date();
  const dateStr = today.getFullYear().toString().substring(2) + 
                  (today.getMonth() + 1).toString().padStart(2, '0') + 
                  today.getDate().toString().padStart(2, '0');
  
  // Calculate next token serial
  const todayOrders = dbData.orders.filter(o => o.token.startsWith(`BKK-${dateStr}`));
  const nextSerial = (todayOrders.length + 1).toString().padStart(3, '0');
  const token = `BKK-${dateStr}-${nextSerial}`;

  const newOrder: Order = {
    id: `order_${Date.now()}`,
    token,
    customerName,
    phone,
    items,
    totalAmount: Number(totalAmount),
    date: today.toISOString(),
    status: 'pending'
  };

  // Adjust stock levels
  items.forEach((orderedItem: any) => {
    const origItem = dbData.items.find(i => i.id === orderedItem.id);
    if (origItem) {
      origItem.stock = Math.max(0, origItem.stock - orderedItem.quantity);
    }
  });

  dbData.orders.push(newOrder);
  writeDb(dbData);
  res.json({ success: true, order: newOrder });
});

// Update Order status (Completed, Cancelled etc.)
app.put('/api/orders/:id', adminAuthMiddleware, (req, res) => {
  const dbData = readDb();
  const index = dbData.orders.findIndex(ord => ord.id === req.params.id);
  if (index !== -1) {
    dbData.orders[index].status = req.body.status;
    writeDb(dbData);
    res.json({ success: true, order: dbData.orders[index] });
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// Dynamic File Storage Image Upload endpoint
app.post('/api/upload', (req, res) => {
  try {
    const { imageData, fileName } = req.body;
    if (!imageData || !fileName) {
      return res.status(400).json({ error: "Missing imageData or fileName" });
    }

    // Strip out base64 tag
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create pristine safe and unique filename
    const ext = path.extname(fileName) || '.jpg';
    const base = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFileName = `${base}_${Date.now()}${ext}`;
    const destinationPath = path.join(UPLOADS_DIR, uniqueFileName);

    fs.writeFileSync(destinationPath, buffer);
    const imageUrl = `/uploads/${uniqueFileName}`;
    res.json({ success: true, imageUrl });
  } catch (err) {
    console.error("Upload handler failed:", err);
    res.status(500).json({ error: "Failed to upload image. Internal disk error." });
  }
});

// --- VITE MIDDLEWARE AND FRONTEND ROUTING ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Basak Khana Khajana Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
