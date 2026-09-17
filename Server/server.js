const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ============ DATABASE CONNECTION ============
// ⚠️ PASTE YOUR CONNECTION STRING BETWEEN THE QUOTES:
const MONGODB_URI = 'mongodb+srv://enginezofficial_db_user:wpLUANCF7flaXObx@cluster0.i7zn1g0.mongodb.net/enginez?appName=Cluster0';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB connection error:', err.message));

// ============ EMAIL CONFIGURATION ============
const EMAIL_USER = 'enginezofficial@gmail.com';
const EMAIL_PASS = 'szaelnxupkundsqb';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

transporter.verify((error) => {
    if (error) console.log('❌ Email setup failed:', error.message);
    else console.log('✅ Email server ready to send!');
});

// ============ DATABASE SCHEMAS ============
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

const orderSchema = new mongoose.Schema({
    customerName: String,
    email: String,
    phone: String,
    address: String,
    paymentMethod: String,
    items: Array,
    totalAmount: Number,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

const messageSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    isRead: { type: Boolean, default: false },
    replied: { type: Boolean, default: false },
    replyText: String,
    createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

const reviewSchema = new mongoose.Schema({
    productId: String,
    reviewerName: String,
    rating: Number,
    reviewText: String,
    createdAt: { type: Date, default: Date.now }
});
const Review = mongoose.model('Review', reviewSchema);

// ============ PRODUCTS ============
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ productId: req.params.id });
        if (!product) return res.status(404).json({ error: 'Not found' });
        res.json(product);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ ORDERS ============
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        console.log('🛒 New order saved:', newOrder.customerName);

        // Email to owner
        try {
            await transporter.sendMail({
                from: `"ENGINEZ Orders" <${EMAIL_USER}>`,
                to: EMAIL_USER,
                subject: `🛒 New Order from ${newOrder.customerName} - Rs. ${newOrder.totalAmount}`,
                html: `
                    <h2 style="color:#e60000;">New Order Received</h2>
                    <p><strong>Customer:</strong> ${newOrder.customerName}</p>
                    <p><strong>Email:</strong> ${newOrder.email}</p>
                    <p><strong>Phone:</strong> ${newOrder.phone}</p>
                    <p><strong>Address:</strong> ${newOrder.address}</p>
                    <p><strong>Payment:</strong> ${newOrder.paymentMethod}</p>
                    <h3>Items:</h3>
                    <ul>${newOrder.items.map(i => `<li>${i.name} x${i.quantity} - Rs.${i.price * i.quantity}</li>`).join('')}</ul>
                    <h3 style="color:#e60000;">Total: Rs. ${newOrder.totalAmount}</h3>
                `
            });
            console.log('📧 Order email sent.');
        } catch (emailErr) {
            console.log('❌ Email failed:', emailErr.message);
        }

        res.json({ success: true, order: newOrder });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) return res.status(404).json({ error: 'Order not found' });
        console.log(`📦 Order ${req.params.id.slice(-6)} → ${status}`);

        // Send status update email
        try {
            const statusMessages = {
                'Shipped': 'Your order has been shipped and is on its way! 🚚',
                'Delivered': 'Your order has been delivered. Thank you! 🎉',
                'Cancelled': 'Your order has been cancelled.'
            };
            if (statusMessages[status]) {
                await transporter.sendMail({
                    from: `"ENGINEZ" <${EMAIL_USER}>`,
                    to: order.email,
                    subject: `📦 Order Update - ${status}`,
                    html: `<h2 style="color:#e60000;">Order Update</h2>
                           <p>Hi ${order.customerName},</p>
                           <p>${statusMessages[status]}</p>
                           <p><strong>Order #${order._id.toString().slice(-6)}</strong></p>
                           <p><strong>Status:</strong> ${status}</p>`
                });
                console.log(`📧 Status email sent to ${order.email}`);
            }
        } catch (emailErr) {
            console.log('❌ Status email failed:', emailErr.message);
        }

        res.json({ success: true, order });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ MESSAGES ============
app.post('/api/contact', async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();
        console.log('✉️  New message saved:', newMessage.name);

        try {
            await transporter.sendMail({
                from: `"ENGINEZ Contact" <${EMAIL_USER}>`,
                to: EMAIL_USER,
                replyTo: newMessage.email,
                subject: `✉️ New Message from ${newMessage.name}`,
                html: `<h2 style="color:#e60000;">New Contact Message</h2>
                       <p><strong>Name:</strong> ${newMessage.name}</p>
                       <p><strong>Email:</strong> ${newMessage.email}</p>
                       <p><strong>Message:</strong></p>
                       <div style="background:#f4f4f4; padding:15px;">${newMessage.message}</div>`
            });
            console.log('📧 Message email sent.');
        } catch (emailErr) {
            console.log('❌ Email failed:', emailErr.message);
        }

        res.json({ success: true, message: 'Message received!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/contact', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/contact/:id/reply', async (req, res) => {
    try {
        const { reply } = req.body;
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ error: 'Message not found' });

        await transporter.sendMail({
            from: `"ENGINEZ Support" <${EMAIL_USER}>`,
            to: message.email,
            subject: `Re: Your inquiry to ENGINEZ`,
            html: `<h2 style="color:#e60000;">Hello ${message.name},</h2>
                   <p style="line-height: 1.6;">${reply.replace(/\n/g, '<br>')}</p>
                   <hr>
                   <p style="color:#888; font-size: 0.85em;">Your original message:</p>
                   <div style="background:#f4f4f4; padding:15px;">${message.message}</div>`
        });

        message.replied = true;
        message.replyText = reply;
        await message.save();

        console.log(`📧 Reply sent to ${message.email}`);
        res.json({ success: true });
    } catch (err) {
        console.log('❌ Reply failed:', err.message);
        res.status(500).json({ error: 'Email failed' });
    }
});

// ============ REVIEWS ============
app.get('/api/reviews/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId });
        res.json(reviews);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const newReview = new Review(req.body);
        await newReview.save();
        console.log('⭐ Review saved for', newReview.productId);
        res.json({ success: true, review: newReview });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log('===========================================');
    console.log(`🚀 ENGINEZ Backend running on port ${PORT}`);
    console.log('===========================================');
});