const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ============ EMAIL CONFIGURATION ============
// ⚠️ REPLACE WITH YOUR OWN GMAIL AND APP PASSWORD
const EMAIL_USER = 'enginezofficial@gmail.com';
const EMAIL_PASS = 'szaelnxupkundsqb';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// Test email on server start
transporter.verify((error) => {
    if (error) {
        console.log('❌ Email setup failed:', error.message);
        console.log('   Check your Gmail App Password in server.js');
    } else {
        console.log('✅ Email server ready to send!');
    }
});

// ============ HELPER FUNCTIONS ============
function readJSON(file) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
}
function writeJSON(file, data) {
    const filePath = path.join(__dirname, file);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ============ PRODUCTS ============
app.get('/api/products', (req, res) => {
    res.json(readJSON('products.json'));
});
app.get('/api/products/:id', (req, res) => {
    const products = readJSON('products.json');
    const product = products.find(p => p.productId === req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
});

// ============ ORDERS ============
app.post('/api/orders', async (req, res) => {
    const orders = readJSON('orders.json');
    const newOrder = {
        id: Date.now().toString(),
        ...req.body,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    writeJSON('orders.json', orders);
    console.log('🛒 New order received:', newOrder.customerName);

    try {
        // Email to OWNER
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

        // Email to CUSTOMER
        await transporter.sendMail({
            from: `"ENGINEZ" <${EMAIL_USER}>`,
            to: newOrder.email,
            subject: `✅ Order Confirmation - ENGINEZ`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <h2 style="color:#e60000;">Thank you, ${newOrder.customerName}!</h2>
                    <p>Your order has been received. We'll contact you soon to confirm delivery.</p>
                    <h3>Order Summary:</h3>
                    <ul>${newOrder.items.map(i => `<li>${i.name} x${i.quantity} - Rs.${i.price * i.quantity}</li>`).join('')}</ul>
                    <p style="font-weight:bold; color:#e60000;">Total: Rs. ${newOrder.totalAmount}</p>
                    <p><strong>Payment:</strong> ${newOrder.paymentMethod}</p>
                    <hr>
                    <p style="color:#888;">ENGINEZ - Drive Clean, Drive Proud</p>
                </div>
            `
        });
        console.log('📧 Order emails sent.');
    } catch (err) {
        console.log('❌ Email error:', err.message);
    }

    res.json({ success: true, order: newOrder });
});

app.get('/api/orders', (req, res) => {
    res.json(readJSON('orders.json'));
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
    const orders = readJSON('orders.json');
    const { status } = req.body;
    const orderIndex = orders.findIndex(o => o.id === req.params.id);
    
    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    writeJSON('orders.json', orders);
    
    console.log(`📦 Order ${req.params.id.slice(-6)} → ${status}`);

    try {
        const order = orders[orderIndex];
        const statusMessages = {
            'Shipped': 'Your order has been shipped and is on its way! 🚚',
            'Delivered': 'Your order has been delivered. Thank you for shopping with us! 🎉',
            'Cancelled': 'Your order has been cancelled. If this was a mistake, please contact us.'
        };
        
        if (statusMessages[status]) {
            await transporter.sendMail({
                from: `"ENGINEZ" <${EMAIL_USER}>`,
                to: order.email,
                subject: `📦 Order Update - ${status}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px;">
                        <h2 style="color:#e60000;">Order Update</h2>
                        <p>Hi ${order.customerName},</p>
                        <p>${statusMessages[status]}</p>
                        <p><strong>Order #${order.id.slice(-6)}</strong></p>
                        <p><strong>New Status:</strong> ${status}</p>
                        <hr>
                        <p style="color:#888;">ENGINEZ - Drive Clean, Drive Proud</p>
                    </div>
                `
            });
            console.log(`📧 Status update email sent to ${order.email}`);
        }
    } catch (err) {
        console.log('❌ Status email failed:', err.message);
    }

    res.json({ success: true, order: orders[orderIndex] });
});

// ============ MESSAGES ============
app.post('/api/contact', async (req, res) => {
    const messages = readJSON('messages.json');
    const newMessage = {
        id: Date.now().toString(),
        ...req.body,
        isRead: false,
        replied: false,
        createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    writeJSON('messages.json', messages);
    console.log('✉️  New message from:', newMessage.name);

    try {
        await transporter.sendMail({
            from: `"ENGINEZ Contact" <${EMAIL_USER}>`,
            to: EMAIL_USER,
            replyTo: newMessage.email,
            subject: `✉️ New Message from ${newMessage.name}`,
            html: `
                <h2 style="color:#e60000;">New Contact Message</h2>
                <p><strong>Name:</strong> ${newMessage.name}</p>
                <p><strong>Email:</strong> ${newMessage.email}</p>
                <p><strong>Message:</strong></p>
                <div style="background:#f4f4f4; padding:15px; border-radius:5px;">${newMessage.message}</div>
            `
        });
        console.log('📧 Message notification sent.');
    } catch (err) {
        console.log('❌ Email error:', err.message);
    }

    res.json({ success: true, message: 'Message received!' });
});

app.get('/api/contact', (req, res) => {
    res.json(readJSON('messages.json'));
});

// ============ REPLY TO A MESSAGE ============
app.post('/api/contact/:id/reply', async (req, res) => {
    const messages = readJSON('messages.json');
    const { reply } = req.body;
    const msgIndex = messages.findIndex(m => m.id === req.params.id);
    
    if (msgIndex === -1) {
        return res.status(404).json({ error: 'Message not found' });
    }
    
    const originalMessage = messages[msgIndex];

    try {
        await transporter.sendMail({
            from: `"ENGINEZ Support" <${EMAIL_USER}>`,
            to: originalMessage.email,
            subject: `Re: Your inquiry to ENGINEZ`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <h2 style="color:#e60000;">Hello ${originalMessage.name},</h2>
                    <p style="line-height: 1.6;">${reply.replace(/\n/g, '<br>')}</p>
                    <hr style="margin: 2rem 0;">
                    <p style="color:#888; font-size: 0.85em;">Your original message:</p>
                    <div style="background:#f4f4f4; padding:15px; border-radius:5px; color:#666; font-size: 0.9em;">
                        ${originalMessage.message}
                    </div>
                    <hr style="margin: 2rem 0;">
                    <p style="color:#888;">ENGINEZ - Drive Clean, Drive Proud</p>
                </div>
            `
        });

        messages[msgIndex].replied = true;
        messages[msgIndex].replyText = reply;
        messages[msgIndex].repliedAt = new Date().toISOString();
        writeJSON('messages.json', messages);

        console.log(`📧 Reply sent to ${originalMessage.email}`);
        res.json({ success: true });
    } catch (err) {
        console.log('❌ Reply email failed:', err.message);
        res.status(500).json({ error: 'Email failed to send' });
    }
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log('===========================================');
    console.log(`🚀 ENGINEZ Backend running!`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log('===========================================');
});
// ============ REVIEWS ============
app.get('/api/reviews/:productId', (req, res) => {
    const reviews = readJSON('reviews.json');
    const productReviews = reviews.filter(r => r.productId === req.params.productId);
    res.json(productReviews);
});

app.post('/api/reviews', (req, res) => {
    const reviews = readJSON('reviews.json');
    const newReview = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    reviews.push(newReview);
    writeJSON('reviews.json', reviews);
    console.log('⭐ New review:', newReview.reviewerName, '-', newReview.rating, 'stars for', newReview.productId);
    res.json({ success: true, review: newReview });
});