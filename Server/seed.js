const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://enginezofficial_db_user:wpLUANCF7flaXObx@cluster0.i7zn1g0.mongodb.net/enginez?appName=Cluster0';

const productSchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    name: String,
    price: Number,
    image: String,
    description: String,
    longDescription: String,
    howToUse: String
});
const Product = mongoose.model('Product', productSchema);

const products = [
    {
        productId: 'prod1',
        name: 'Gloss Finish Protectant (Jasmine) with Microfiber',
        price: 998,
        image: 'images/jasmine.jpeg',
        description: 'Premium gloss finish protectant infused with a soothing Jasmine fragrance.',
        longDescription: `<p>Elevate the look of your car with <strong>Prato Gloss Finish Protectant</strong>. This premium formula delivers a stunning, long-lasting shine while providing essential protection.</p><h3>Key Features:</h3><div class="feature-badge-list"><span class="feature-badge"><i class="fa-solid fa-shield-halved"></i> UV Protection</span> <span class="feature-badge"><i class="fa-solid fa-sparkles"></i> Restores Luster</span> <span class="feature-badge"><i class="fa-solid fa-ban"></i> Anti-Static</span> <span class="feature-badge"><i class="fa-solid fa-hand-sparkles"></i> Silicone Polymer Formula</span></div><ul><li><strong>Deep Shine:</strong> Unique polymer silicone formula penetrates deep into the surface to shine and protect vinyl, rubber, and plastic.</li><li><strong>UV Defense:</strong> Helps protect surfaces from fading and cracking by reducing ultraviolet light damage.</li><li><strong>Restores Color:</strong> Brings out the original color, restoring luster and shine.</li><li><strong>Anti-Static:</strong> Reduces static electricity to help repel dust and dirt.</li><li><strong>Protects Against Abrasion:</strong> Adds a protective layer against everyday wear and tear.</li></ul><p><em>If less shine is desired, lightly buff the surface with a damp cloth.</em></p>`,
        howToUse: `<h3>Usage Directions</h3><div class="howto-step"><div class="howto-step-number">1</div><div class="howto-step-content"><h4>Prepare the Surface</h4><p>Thoroughly clean the surface with a high-quality cleaner. Ensure the area is free of dust and dirt before application.</p></div></div><div class="howto-step"><div class="howto-step-number">2</div><div class="howto-step-content"><h4>Apply the Protectant</h4><p>Apply Prato Gloss Finish Protectant with a clean cloth or sponge.</p></div></div><div class="howto-step"><div class="howto-step-number">3</div><div class="howto-step-content"><h4>Spread & Buff</h4><p>Spread evenly and allow it to penetrate for a few minutes. Remove excess with a clean, dry microfiber cloth.</p></div></div><div class="safety-warning"><i class="fa-solid fa-triangle-exclamation"></i><div><strong>⚠️ Important Safety Warnings:</strong><p><strong>Not for use on:</strong> Floor, vehicle controls, bench/cycle seats, cycle tires, brake drums, or slippery surfaces.</p><p><strong>Do not use on:</strong> Clear plastic, glass, fabric, woven materials, or paint.</p><p><strong>KEEP AWAY FROM CHILDREN AND ANIMALS.</strong></p></div></div>`
    },
    {
        productId: 'prod2',
        name: 'Gloss Finish Protectant (Lemon) with Microfiber',
        price: 998,
        image: 'images/lemon.jpeg',
        description: 'Premium gloss finish protectant with a refreshing Lemon scent.',
        longDescription: `<p>Elevate the look of your car with <strong>Prato Gloss Finish Protectant (Lemon)</strong>. This premium formula delivers a stunning, long-lasting shine.</p><h3>Key Features:</h3><div class="feature-badge-list"><span class="feature-badge"><i class="fa-solid fa-shield-halved"></i> UV Protection</span> <span class="feature-badge"><i class="fa-solid fa-sparkles"></i> Restores Luster</span> <span class="feature-badge"><i class="fa-solid fa-ban"></i> Anti-Static</span> <span class="feature-badge"><i class="fa-solid fa-hand-sparkles"></i> Silicone Polymer Formula</span></div><ul><li><strong>Deep Shine:</strong> Unique polymer silicone formula.</li><li><strong>UV Defense:</strong> Reduces ultraviolet light damage.</li><li><strong>Restores Color:</strong> Brings out original luster.</li><li><strong>Anti-Static:</strong> Repels dust and dirt.</li><li><strong>Protects Against Abrasion:</strong> Adds a protective layer.</li></ul><p><em>If less shine is desired, lightly buff the surface with a damp cloth.</em></p>`,
        howToUse: `<h3>Usage Directions</h3><div class="howto-step"><div class="howto-step-number">1</div><div class="howto-step-content"><h4>Prepare the Surface</h4><p>Thoroughly clean the surface with a high-quality cleaner.</p></div></div><div class="howto-step"><div class="howto-step-number">2</div><div class="howto-step-content"><h4>Apply the Protectant</h4><p>Apply with a clean cloth or sponge.</p></div></div><div class="howto-step"><div class="howto-step-number">3</div><div class="howto-step-content"><h4>Spread & Buff</h4><p>Spread evenly and remove excess with a dry microfiber cloth.</p></div></div><div class="safety-warning"><i class="fa-solid fa-triangle-exclamation"></i><div><strong>⚠️ Important Safety Warnings:</strong><p><strong>Not for use on:</strong> Floor, vehicle controls, bench/cycle seats, or slippery surfaces.</p><p><strong>KEEP AWAY FROM CHILDREN AND ANIMALS.</strong></p></div></div>`
    },
    {
        productId: 'prod3',
        name: 'Gloss Finish Protectant (Oud) with Microfiber',
        price: 998,
        image: 'images/oud.jpeg',
        description: 'Premium gloss finish protectant with a luxurious Oud fragrance.',
        longDescription: `<p>Elevate the look of your car with <strong>Prato Gloss Finish Protectant (Oud)</strong>. This premium formula delivers a stunning, long-lasting shine.</p><h3>Key Features:</h3><div class="feature-badge-list"><span class="feature-badge"><i class="fa-solid fa-shield-halved"></i> UV Protection</span> <span class="feature-badge"><i class="fa-solid fa-sparkles"></i> Restores Luster</span> <span class="feature-badge"><i class="fa-solid fa-ban"></i> Anti-Static</span> <span class="feature-badge"><i class="fa-solid fa-hand-sparkles"></i> Silicone Polymer Formula</span></div><ul><li><strong>Deep Shine:</strong> Unique polymer silicone formula.</li><li><strong>UV Defense:</strong> Reduces ultraviolet light damage.</li><li><strong>Restores Color:</strong> Brings out original luster.</li><li><strong>Anti-Static:</strong> Repels dust and dirt.</li><li><strong>Protects Against Abrasion:</strong> Adds a protective layer.</li></ul><p><em>If less shine is desired, lightly buff the surface with a damp cloth.</em></p>`,
        howToUse: `<h3>Usage Directions</h3><div class="howto-step"><div class="howto-step-number">1</div><div class="howto-step-content"><h4>Prepare the Surface</h4><p>Thoroughly clean the surface.</p></div></div><div class="howto-step"><div class="howto-step-number">2</div><div class="howto-step-content"><h4>Apply the Protectant</h4><p>Apply with a clean cloth.</p></div></div><div class="howto-step"><div class="howto-step-number">3</div><div class="howto-step-content"><h4>Spread & Buff</h4><p>Spread evenly and remove excess.</p></div></div><div class="safety-warning"><i class="fa-solid fa-triangle-exclamation"></i><div><strong>⚠️ Important Safety Warnings:</strong><p><strong>KEEP AWAY FROM CHILDREN AND ANIMALS.</strong></p></div></div>`
    },
    {
        productId: 'prod4',
        name: 'Gloss Finish Protectant (Black Ice) with Microfiber',
        price: 998,
        image: 'images/black-ice.jpeg',
        description: 'Premium gloss finish protectant with a bold Black Ice scent.',
        longDescription: `<p>Elevate the look of your car with <strong>Prato Gloss Finish Protectant (Black Ice)</strong>. This premium formula delivers a stunning, long-lasting shine.</p><h3>Key Features:</h3><div class="feature-badge-list"><span class="feature-badge"><i class="fa-solid fa-shield-halved"></i> UV Protection</span> <span class="feature-badge"><i class="fa-solid fa-sparkles"></i> Restores Luster</span> <span class="feature-badge"><i class="fa-solid fa-ban"></i> Anti-Static</span> <span class="feature-badge"><i class="fa-solid fa-hand-sparkles"></i> Silicone Polymer Formula</span></div><ul><li><strong>Deep Shine:</strong> Unique polymer silicone formula.</li><li><strong>UV Defense:</strong> Reduces ultraviolet light damage.</li><li><strong>Restores Color:</strong> Brings out original luster.</li><li><strong>Anti-Static:</strong> Repels dust and dirt.</li><li><strong>Protects Against Abrasion:</strong> Adds a protective layer.</li></ul><p><em>If less shine is desired, lightly buff the surface with a damp cloth.</em></p>`,
        howToUse: `<h3>Usage Directions</h3><div class="howto-step"><div class="howto-step-number">1</div><div class="howto-step-content"><h4>Prepare the Surface</h4><p>Thoroughly clean the surface.</p></div></div><div class="howto-step"><div class="howto-step-number">2</div><div class="howto-step-content"><h4>Apply the Protectant</h4><p>Apply with a clean cloth.</p></div></div><div class="howto-step"><div class="howto-step-number">3</div><div class="howto-step-content"><h4>Spread & Buff</h4><p>Spread evenly and remove excess.</p></div></div><div class="safety-warning"><i class="fa-solid fa-triangle-exclamation"></i><div><strong>⚠️ Important Safety Warnings:</strong><p><strong>KEEP AWAY FROM CHILDREN AND ANIMALS.</strong></p></div></div>`
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        await Product.deleteMany({});
        console.log('🗑️  Cleared old products');
        await Product.insertMany(products);
        console.log(`✅ Added ${products.length} products to MongoDB`);
        mongoose.connection.close();
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}
seed();