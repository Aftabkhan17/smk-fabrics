const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Master Database URI Switch for Render Production Environment vs. Local Sandbox
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://smkadmin:Smk11fabrics2026@cluster0.vhck7gz.mongodb.net/smkfabrics?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI)
    .then(() => console.log("🟢 Connected securely to MongoDB Atlas Cloud Clusters!"))
    .catch(err => console.error("❌ MongoDB connection failure:", err));

// 1. Upgraded Production Schema supporting Multi-Image Arrays & Technical Specifications
const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    title: { type: String, required: true },
    basePricePerMeter: { type: Number, required: true },
    images: [{ type: String }], // Array matching multiple slide photo configurations
    category: { type: String, required: true }, // shirting, suiting, combo
    specs: {
        weave: String,   // Oxford, Twill, Satin, Satin Sateen, Matty
        blend: String,   // 100% Giza Cotton, Poly Viscose, Merino Wool Blend
        weight: String   // Lightweight Shirting, Medium Worsted Suiting
    }
});

const Product = mongoose.model('Product', productSchema);

// 2. Automated Seed Script: Pops premium menswear stock automatically if collections are empty
async function seedPremiumDatabase() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log("📦 Initializing premium database records seeding sequence...");
            const luxuryStock = [
                {
                    id: "p1",
                    brand: "Siyaram's",
                    title: "Mistair Premium Poly Viscose Suiting Fabric (Charcoal Grey)",
                    basePricePerMeter: 850,
                    images: [
                        "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=600",
                        "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600"
                    ],
                    category: "suiting",
                    specs: { weave: "Twill Weave", blend: "Poly Viscose Premium", weight: "Medium Worsted Suiting" }
                },
                {
                    id: "p2",
                    brand: "Raymond",
                    title: "Super 120s Merino Wool Blend Suiting Fabric (Midnight Navy)",
                    basePricePerMeter: 2450,
                    images: [
                        "https://images.unsplash.com/photo-1584031402256-fc42d6efce36?q=80&w=600",
                        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600"
                    ],
                    category: "suiting",
                    specs: { weave: "Matty Satin", blend: "80% Merino Wool / 20% Silk", weight: "Luxury Tailoring Weight" }
                },
                {
                    id: "p3",
                    brand: "Arvind",
                    title: "Tresca 100% Giza Cotton Oxford Weave Shirting (Sky Blue)",
                    basePricePerMeter: 1250,
                    images: [
                        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600",
                        "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=600"
                    ],
                    category: "shirting",
                    specs: { weave: "Classic Oxford", blend: "100% Long-Staple Giza Cotton", weight: "Lightweight Breathable" }
                }
            ];
            await Product.insertMany(luxuryStock);
            console.log("✅ Premium database seeded beautifully with multi-image arrays!");
        }
    } catch (err) {
        console.error("⚠️ Database seeding execution error:", err);
    }
}
seedPremiumDatabase();

// 3. REST API ENDPOINTS
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Failed to read products out of cluster data grid" });
    }
});

// Admin Panel Endpoint Injector supporting multi-image input fields
app.post('/api/products/add', async (req, res) => {
    try {
        const { id, brand, title, basePricePerMeter, images, category, weave, blend, weight } = req.body;
        const newProduct = new Product({
            id, brand, title, basePricePerMeter,
            images: Array.isArray(images) ? images : [images], // Forces text values to an Array format
            category,
            specs: { weave, blend, weight }
        });
        await newProduct.save();
        res.status(201).json({ message: "Product securely mounted to MongoDB cloud dataset!" });
    } catch (err) {
        res.status(400).json({ error: "Submission rejection inside active cluster validation rules." });
    }
});
// =============================================================
// ENTERPRISE CRUD EXTENSIONS: UPDATE & DELETE ENDPOINTS
// =============================================================

// Route: Update an existing product document in MongoDB Atlas
app.put('/api/products/update/:id', async (req, res) => {
    try {
        const { brand, title, basePricePerMeter, images, category, weave, blend, weight } = req.body;
        
        const updatedProduct = await Product.findOneAndUpdate(
            { id: req.params.id },
            {
                brand,
                title,
                basePricePerMeter,
                images: Array.isArray(images) ? images : [images],
                category,
                specs: { weave, blend, weight }
            },
            { new: true } // Returns the newly updated data file
        );

        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found inside active cluster registry." });
        }

        res.json({ message: "Product updated securely inside MongoDB cloud dataset!", product: updatedProduct });
    } catch (err) {
        res.status(400).json({ error: "Update rejected due to structural validation rules." });
    }
});

// Route: Permanently delete a product from the database cluster
app.delete('/api/products/delete/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findOneAndDelete({ id: req.params.id });
        if (!deletedProduct) {
            return res.status(404).json({ error: "Target product string not found." });
        }
        res.json({ message: "Product dropped cleanly out of cloud collection grids!" });
    } catch (err) {
        res.status(500).json({ error: "Internal deletion gateway failure." });
    }
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => console.log(`🚀 SMK FABRICS ENGINE UP ON PORT ${PORT}`));