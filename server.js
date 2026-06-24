const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================================
// 🔥 1. PASTE YOUR MONGODB CONNECTION STRING HERE 🔥
// =============================================================
// Dynamically read the secret key injected by the cloud host configuration panel
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/smkfabrics";
// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// =============================================================
// 2. DATABASE CONNECTION & SCHEMA DEFINITION
// =============================================================
mongoose.connect(MONGO_URI)
    .then(() => console.log("🟢 Successfully connected to MongoDB Atlas!"))
    .catch(err => console.error("🔴 MongoDB Connection Error:", err));

// Define what a "Product" looks like in our database
const productSchema = new mongoose.Schema({
    id: String,
    brand: String,
    title: String,
    basePricePerMeter: Number,
    image: String,
    category: String
});

// Create the Model
const Product = mongoose.model('Product', productSchema);

// =============================================================
// 3. AUTOMATIC DATABASE SEEDING (One-time setup)
// =============================================================
const seedDatabase = async () => {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log("Database is empty. Seeding initial SMK Fabrics inventory...");
            await Product.insertMany([
                { id: "p1", brand: "Siyaram's", title: "Siyaram's Mistair Premium Poly Viscose Suiting (Charcoal Grey)", basePricePerMeter: 850, image: "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=600", category: "suiting" },
                { id: "p2", brand: "Raymond", title: "Raymond Super 120s Merino Wool Blend Suiting (Midnight Navy)", basePricePerMeter: 2450, image: "https://images.unsplash.com/photo-1584031402256-fc42d6efce36?q=80&w=600", category: "suiting" },
                { id: "p3", brand: "Arvind", title: "Arvind Tresca 100% Giza Cotton Oxford Weave Shirting (Sky Blue)", basePricePerMeter: 1250, image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600", category: "shirting" },
                { id: "p4", brand: "J. Hampstead", title: "J. Hampstead Premium Terry Rayon Striped Suiting (Jet Black)", basePricePerMeter: 1680, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600", category: "suiting" },
                { id: "p5", brand: "Donear", title: "Donear Royal Wrinkle-Free Cotton Shirting (White, Micro Dobby)", basePricePerMeter: 920, image: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=600", category: "shirting" },
                { id: "p6", brand: "SMK Exclusive", title: "Premium Unstitched Gift Box Combo (2.5m Cotton Shirt + 1.3m TR Pant)", basePricePerMeter: 2199, image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=600", category: "combo" }
            ]);
            console.log("✅ Initial inventory seeded successfully!");
        }
    } catch (err) {
        console.error("Seeding error:", err);
    }
};
// Run the seeder
seedDatabase();

// =============================================================
// 4. BACKEND REST API ENDPOINTS
// =============================================================

// Route Path: Fetch all products from the REAL database (Keep this!)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Error fetching products from database" });
    }
});

// 🔥 NEW ROUTE: Intercept incoming POST data from the admin dashboard
app.post('/api/products', async (req, res) => {
    try {
        const structuralEntry = new Product(req.body);
        await structuralEntry.save();
        res.status(201).json({ message: "Product safely documented in storage matrix" });
    } catch (err) {
        res.status(500).json({ message: "Internal Server database transaction failure" });
    }
});

// 🔥 NEW ROUTE: Serve the physical Admin form dashboard view interface
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Root route to render your storefront (Keep this!)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Fire up the live local server engine (Keep this!)
app.listen(PORT, () => {
    console.log(`\n================================================================`);
    console.log(`🚀 SMK FABRICS SERVER ACTIVE`);
    console.log(`🌍 Access your live store dashboard at: http://localhost:${PORT}`);
    console.log(`================================================================\n`);
});