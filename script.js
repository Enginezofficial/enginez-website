// =====================================================
// ENGINEZ - script.js (FIXED VERSION)
// =====================================================

// --- Product Database (Fetched from backend) ---
let productDatabase = {};
let productsLoadingPromise = null;

function loadProducts() {
    if (productsLoadingPromise) return productsLoadingPromise;
    productsLoadingPromise = fetch('http://localhost:5000/api/products')
        .then(res => res.json())
        .then(products => {
            products.forEach(p => {
                                productDatabase[p.productId] = {
                    name: p.name,
                    price: p.price,
                    image: p.image,
                    description: p.description,
                    longDescription: p.longDescription,
                    howToUse: p.howToUse
                };
            });
            console.log('✅ Products loaded:', productDatabase);
            return productDatabase;
        })
        .catch(err => {
            console.error('❌ Backend error:', err);
            productsLoadingPromise = null;
        });
    return productsLoadingPromise;
}
loadProducts();

// --- Cart ---
let cart = JSON.parse(localStorage.getItem('enginezCart')) || [];

function saveCart() {
    localStorage.setItem('enginezCart', JSON.stringify(cart));
    updateCartUI();
}

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
        drawer.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

function addToCart(name, price, id) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ id, name, price, quantity: 1 });
    saveCart();
    toggleCart();
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => { cartIcon.style.transform = 'scale(1)'; }, 200);
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    if (!cartCount || !cartItemsContainer || !cartTotalPrice) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
        cartTotalPrice.textContent = 'Rs. 0.00';
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.quantity} x Rs. ${item.price.toFixed(2)}</p>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>`;
    });
    cartTotalPrice.textContent = `Rs. ${total.toFixed(2)}`;
}

function checkout() {
    if (cart.length === 0) alert("Your cart is empty!");
    else window.location.href = 'checkout.html';
}

// --- Add to Cart from Details Page (SAFE) ---
function addToCartFromDetails(productId) {
    const product = productDatabase[productId];
    if (!product) {
        alert('Product is still loading. Please wait a moment and try again.');
        return;
    }
    const qtyInput = document.getElementById('qty');
    const qty = parseInt(qtyInput.value) || 1;
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) existingItem.quantity += qty;
    else cart.push({ id: productId, name: product.name, price: product.price, quantity: qty });
    saveCart();
    toggleCart();
}

// --- Place Order ---
async function placeOrder(event) {
    if (event) event.preventDefault();
    const form = document.getElementById('checkout-form');
    if (!form) return;

    const name = form.querySelector('input[name="customerName"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const phone = form.querySelector('input[name="phone"]').value.trim();
    const address = form.querySelector('textarea[name="address"]').value.trim();

    if (!name || !email || !phone || !address) {
        alert('Please fill in all fields!');
        return;
    }
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const paymentRadio = form.querySelector('input[name="payment"]:checked');
    const paymentMethod = paymentRadio ? paymentRadio.nextElementSibling.textContent.trim() : 'Cash on Delivery';
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const submitBtn = document.querySelector('.btn-place-order');
    if (submitBtn) { submitBtn.innerHTML = 'Placing Order...'; submitBtn.disabled = true; }

    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName: name, email, phone, address,
                paymentMethod, items: cart, totalAmount
            })
        });
        const data = await response.json();
        if (data.success) {
            cart = [];
            localStorage.removeItem('enginezCart');
            window.location.href = 'order-success.html';
        } else {
            alert('Order failed.');
            if (submitBtn) { submitBtn.innerHTML = 'Place Order'; submitBtn.disabled = false; }
        }
    } catch (err) {
        alert('Could not connect to server.');
        if (submitBtn) { submitBtn.innerHTML = 'Place Order'; submitBtn.disabled = false; }
    }
}

// --- Search Toggle ---
function toggleSearch() {
    let sc = document.getElementById('search-container');
    if (!sc) {
        sc = document.createElement('div');
        sc.className = 'search-container';
        sc.id = 'search-container';
        sc.innerHTML = '<input type="text" id="search-input" placeholder="Search for products...">';
        const tn = document.querySelector('.top-navbar');
        if (tn) tn.parentNode.insertBefore(sc, tn.nextSibling);
        const input = document.getElementById('search-input');
        input.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.product-card').forEach(card => {
                const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                card.style.display = title.includes(q) ? 'flex' : 'none';
            });
        });
    }
    sc.classList.toggle('active');
    if (sc.classList.contains('active')) {
        const input = document.getElementById('search-input');
        if (input) input.focus();
    }
}

// --- Profile Menu ---
function toggleProfileMenu() {
    let menu = document.getElementById('profile-menu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'profile-menu';
        menu.className = 'profile-menu';
        menu.innerHTML = `
            <div class="profile-menu-header">
                <i class="fa-regular fa-circle-user"></i>
                <div>
                    <p class="profile-menu-welcome">Welcome to ENGINEZ</p>
                    <p class="profile-menu-sub">Track orders or contact us</p>
                </div>
            </div>
            <a href="#" onclick="openTrackOrder(); return false;"><i class="fa-solid fa-box"></i> Track My Order</a>
            <a href="contact.html"><i class="fa-solid fa-headset"></i> Contact Support</a>
            <a href="#" onclick="toggleCart(); return false;"><i class="fa-solid fa-bag-shopping"></i> My Cart</a>
        `;
        document.body.appendChild(menu);
        document.addEventListener('click', () => menu.classList.remove('active'));
        menu.addEventListener('click', (e) => e.stopPropagation());
    }
    menu.classList.toggle('active');
}

// --- Track Order Modal ---
function openTrackOrder() {
    const menu = document.getElementById('profile-menu');
    if (menu) menu.classList.remove('active');

    let modal = document.getElementById('track-order-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'track-order-modal';
        modal.className = 'track-modal-overlay';
        modal.innerHTML = `
            <div class="track-modal" onclick="event.stopPropagation()">
                <div class="track-modal-header">
                    <h2>Track My Order</h2>
                    <i class="fa-solid fa-xmark" onclick="closeTrackOrder()"></i>
                </div>
                <p style="color: #666; margin-bottom: 1.5rem;">Enter the email or phone number you used when placing your order.</p>
                <input type="text" id="track-input" placeholder="Email or Phone" class="track-input">
                <button onclick="searchOrders()" class="btn-primary" style="width: 100%; margin-top: 1rem;">Search Orders</button>
                <div id="track-results" style="margin-top: 1.5rem;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', () => closeTrackOrder());
    }
    modal.classList.add('active');
    setTimeout(() => document.getElementById('track-input').focus(), 200);
}

function closeTrackOrder() {
    const modal = document.getElementById('track-order-modal');
    if (modal) modal.classList.remove('active');
    const results = document.getElementById('track-results');
    if (results) results.innerHTML = '';
    const input = document.getElementById('track-input');
    if (input) input.value = '';
}

async function searchOrders() {
    const query = document.getElementById('track-input').value.trim();
    const results = document.getElementById('track-results');
    if (!query) {
        results.innerHTML = '<p style="color:#e60000; text-align:center;">Please enter email or phone.</p>';
        return;
    }
    results.innerHTML = '<p style="text-align:center; color:#666;">Searching...</p>';
    try {
        const res = await fetch('http://localhost:5000/api/orders');
        const orders = await res.json();
        const matched = orders.filter(o =>
            (o.email && o.email.toLowerCase() === query.toLowerCase()) ||
            (o.phone && o.phone.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, ''))
        );
        if (matched.length === 0) {
            results.innerHTML = '<p style="color:#666; text-align:center;">No orders found.</p>';
            return;
        }
        let html = `<h3 style="margin-bottom:1rem;">Found ${matched.length} order(s):</h3>`;
        matched.forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString();
            const statusClass = (order.status || 'pending').toLowerCase();
            html += `
                <div style="background:#f9f9f9; padding:1rem; border-radius:8px; margin-bottom:1rem; border-left:4px solid var(--primary-red);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                        <strong>Order #${order.id.slice(-6)}</strong>
                        <span class="status-badge status-${statusClass}">${order.status || 'Pending'}</span>
                    </div>
                    <p style="font-size:0.85rem; color:#666;">${date}</p>
                    <p style="font-size:0.9rem; margin:0.5rem 0;"><strong>Items:</strong> ${order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</p>
                    <p style="font-weight:700; color:var(--primary-red);">Total: Rs. ${order.totalAmount.toFixed(2)}</p>
                </div>`;
        });
        results.innerHTML = html;
    } catch (err) {
        results.innerHTML = '<p style="color:#e60000; text-align:center;">Could not load orders.</p>';
    }
}

// --- Contact Form Submission (bulletproof) ---
async function submitContactForm(event) {
    if (event) event.preventDefault();
    
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    const submitBtn = document.querySelector('#contact-form button');
    const originalText = submitBtn.innerHTML;
    
    const name = contactForm.querySelector('input[name="name"]').value.trim();
    const email = contactForm.querySelector('input[name="email"]').value.trim();
    const message = contactForm.querySelector('textarea[name="message"]').value.trim();
    
    if (!name || !email || !message) {
        alert('Please fill in all fields!');
        return;
    }
    
    submitBtn.innerHTML = 'Sending...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:5000/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message })
        });

        const data = await response.json();

        if (data.success) {
            const formWrapper = document.getElementById('contact-form-wrapper');
            const successDiv = document.getElementById('contact-success');
            
            if (formWrapper) formWrapper.style.display = 'none';
            if (successDiv) successDiv.style.display = 'block';
            
            sessionStorage.setItem('contactSubmitted', 'true');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            contactForm.reset();
        } else {
            alert('Something went wrong.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        alert('Could not connect to server.');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// =====================================================
// ADMIN PANEL LOGIC
// =====================================================
const ADMIN_PASSWORD = 'admin123'; // <--- CHANGE THIS TO YOUR OWN SECURE PASSWORD

function loginAdmin() {
    const input = document.getElementById('admin-password').value;
    const error = document.getElementById('login-error');
    if (input === ADMIN_PASSWORD) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard-screen').style.display = 'block';
        sessionStorage.setItem('adminLoggedIn', 'true');
        loadAdminData();
    } else {
        error.textContent = 'Incorrect password.';
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('adminLoggedIn');
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('dashboard-screen').style.display = 'none';
    document.getElementById('admin-password').value = '';
}

function showTab(tabName, event) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    document.getElementById('tab-orders').style.display = tabName === 'orders' ? 'block' : 'none';
    document.getElementById('tab-messages').style.display = tabName === 'messages' ? 'block' : 'none';
}

async function loadAdminData() {
    // Load orders
    try {
        const ordersRes = await fetch('http://localhost:5000/api/orders');
        const orders = await ordersRes.json();
        
        document.getElementById('stat-orders').textContent = orders.length;
        const totalRev = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        document.getElementById('stat-revenue').textContent = 'Rs. ' + totalRev.toFixed(0);

        const ordersContainer = document.getElementById('orders-table-container');
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p>No orders yet.</p>';
        } else {
            let html = '<table class="admin-table"><thead><tr><th>Date</th><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>';
            orders.reverse().forEach(o => {
                const itemsList = o.items.map(i => `${i.name} x${i.quantity}`).join(', ');
                const statusClass = (o.status || 'pending').toLowerCase();
                html += `<tr>
                    <td>${new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>${o.customerName}</td>
                    <td>${o.phone}</td>
                    <td style="max-width:200px; font-size:0.85rem;">${itemsList}</td>
                    <td>Rs. ${o.totalAmount}</td>
                    <td>${o.paymentMethod}</td>
                    <td>
                        <select onchange="updateOrderStatus('${o.id}', this.value, event)" class="status-dropdown status-${statusClass}">
                            <option value="Pending" ${o.status === 'Pending' || !o.status ? 'selected' : ''}>Pending</option>
                            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                </tr>`;
            });
            html += '</tbody></table>';
            ordersContainer.innerHTML = html;
        }
    } catch (err) { console.error(err); }

    // Load messages
    try {
        const msgRes = await fetch('http://localhost:5000/api/contact');
        const messages = await msgRes.json();
        document.getElementById('stat-messages').textContent = messages.length;

        const messagesContainer = document.getElementById('messages-list-container');
        if (messages.length === 0) {
            messagesContainer.innerHTML = '<p>No messages yet.</p>';
        } else {
            let html = '';
            messages.reverse().forEach(m => {
                html += `<div class="message-card">
                    <div class="message-header">
                        <strong>${m.name}</strong>
                        <span>${m.email}</span>
                        <span class="message-date">${new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p class="message-body">${m.message}</p>
                </div>`;
            });
            messagesContainer.innerHTML = html;
        }
    } catch (err) { console.error(err); }
}

// --- Update Order Status from Admin (no full reload) ---
async function updateOrderStatus(orderId, newStatus, event) {
    try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log(`✅ Order status updated to ${newStatus}`);
            // Just update the dropdown's color class without full reload
            if (event && event.target) {
                event.target.className = 'status-dropdown status-' + newStatus.toLowerCase();
            }
        } else {
            alert('Failed to update status.');
        }
    } catch (err) {
        console.error('Status update error:', err);
        alert('Could not update status. Is the backend running?');
    }
}

// =====================================================
// GLOBAL EVENT LISTENERS (runs on every page)
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
    updateCartUI();

    // --- Product Details Page ---
        const detailsContainer = document.getElementById('product-details-container');
    if (detailsContainer) {
        await loadProducts();
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        currentProductId = productId;
        const product = productDatabase[productId];
        if (product) {
            document.getElementById('breadcrumb-name').textContent = product.name;
            detailsContainer.innerHTML = `
                <div class="product-details-wrapper">
                    <div class="details-image" style="background-image: url('${product.image}');"></div>
                    <div class="details-info">
                        <h1>${product.name}</h1>
                        <p class="details-price">Rs. ${product.price.toFixed(2)} PKR</p>
                        <p class="details-desc">${product.description}</p>
                        <div class="quantity-selector">
                            <label for="qty">Quantity:</label>
                            <input type="number" id="qty" class="qty-input" value="1" min="1">
                        </div>
                        <button class="btn-add-large" onclick="addToCartFromDetails('${productId}')">Add to Cart</button>
                    </div>
                </div>`;
            
            // Show tabs and load content
            const tabsSection = document.getElementById('product-tabs-section');
            if (tabsSection) {
                tabsSection.style.display = 'block';
                
                const descContent = document.getElementById('description-content');
                if (descContent) descContent.innerHTML = product.longDescription || `<p>${product.description}</p>`;
                
                const howtoContent = document.getElementById('howto-content');
                if (howtoContent) howtoContent.innerHTML = product.howToUse || `<p>Instructions coming soon.</p>`;
                
                loadReviews(productId);
            }
        } else {
            detailsContainer.innerHTML = '<h2 style="text-align:center; padding: 5rem;">Product not found!</h2>';
        }
    }

    // --- Checkout Summary ---
    const checkoutSummary = document.getElementById('checkout-summary-items');
    const checkoutTotal = document.getElementById('checkout-total-price');
    if (checkoutSummary && checkoutTotal) {
        if (cart.length === 0) {
            checkoutSummary.innerHTML = '<p>Your cart is empty.</p>';
            checkoutTotal.textContent = 'Rs. 0.00';
        } else {
            let total = 0;
            let html = '';
            cart.forEach(item => {
                total += item.price * item.quantity;
                html += `<div class="summary-item"><span>${item.name} x ${item.quantity}</span><span>Rs. ${(item.price * item.quantity).toFixed(2)}</span></div>`;
            });
            checkoutSummary.innerHTML = html;
            checkoutTotal.textContent = `Rs. ${total.toFixed(2)}`;
        }
    }

    // --- Contact Form (restore success state) ---
    if (sessionStorage.getItem('contactSubmitted') === 'true') {
        const formWrapper = document.getElementById('contact-form-wrapper');
        const successDiv = document.getElementById('contact-success');
        if (formWrapper) formWrapper.style.display = 'none';
        if (successDiv) successDiv.style.display = 'block';
    }

    // --- Profile Icon ---
    const profileIcon = document.querySelector('.fa-user');
    if (profileIcon) {
        profileIcon.style.cursor = 'pointer';
        profileIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleProfileMenu();
        });
    }

    // --- Admin Auto-Login ---
    const isAdminPage = window.location.pathname.endsWith('admin.html') || window.location.href.includes('admin.html');
    if (isAdminPage) {
        if (sessionStorage.getItem('adminLoggedIn') === 'true') {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('dashboard-screen').style.display = 'block';
            loadAdminData();
        }
    }
});
// =====================================================
// PRODUCT TABS & REVIEWS
// =====================================================
let currentProductId = null;

function showProductTab(tabName, event) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    if (event && event.target) {
        const btn = event.target.closest('.tab-btn');
        if (btn) btn.classList.add('active');
    }
    
    const tab = document.getElementById('tab-' + tabName);
    if (tab) tab.classList.add('active');
}

// ===== Reviews =====
let allReviews = [];
let currentReviewFilter = 'all';

async function loadReviews(productId) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;
    
    reviewsList.innerHTML = '<p style="text-align:center; color:#999;">Loading reviews...</p>';
    
    try {
        const res = await fetch(`http://localhost:5000/api/reviews/${productId}`);
        const reviews = await res.json();
        allReviews = reviews;
        
        const avgRating = reviews.length > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : '0.0';
        
        const avgNum = document.getElementById('avg-rating-number');
        const totalEl = document.getElementById('total-reviews');
        const tabCount = document.getElementById('review-count-tab');
        const avgStars = document.getElementById('avg-stars');
        
        if (avgNum) avgNum.textContent = avgRating;
        if (totalEl) totalEl.textContent = reviews.length;
        if (tabCount) tabCount.textContent = reviews.length;
        
        if (avgStars) {
            const starCount = Math.round(parseFloat(avgRating));
            avgStars.textContent = '★'.repeat(starCount) + '☆'.repeat(5 - starCount);
        }
        
        // Build star breakdown
        const breakdown = document.getElementById('reviews-breakdown');
        if (breakdown) {
            let breakdownHTML = '';
            for (let star = 5; star >= 1; star--) {
                const count = reviews.filter(r => r.rating === star).length;
                const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                breakdownHTML += `
                    <div class="breakdown-row">
                        <span class="row-label">${star} <i class="fa-solid fa-star"></i></span>
                        <div class="row-bar">
                            <div class="row-fill" style="width: ${percent}%;"></div>
                        </div>
                        <span class="row-count">${count}</span>
                    </div>
                `;
            }
            breakdown.innerHTML = breakdownHTML;
        }
        
        // Render reviews
        renderReviewCards(reviews);
        
    } catch (err) {
        console.error('Reviews error:', err);
        reviewsList.innerHTML = '<p style="text-align:center; color:#999;">No reviews yet. Be the first!</p>';
    }
}

function renderReviewCards(reviews) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="no-reviews">
                <i class="fa-regular fa-star"></i>
                <h3>No reviews yet</h3>
                <p>Be the first to share your experience!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    reviews.slice().reverse().forEach(r => {
        const initial = r.reviewerName.charAt(0).toUpperCase();
        const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        const date = new Date(r.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric' 
        });
        
        html += `
            <div class="review-card">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">${initial}</div>
                        <div class="reviewer-details">
                            <h4>
                                ${r.reviewerName}
                                <span class="verified-badge"><i class="fa-solid fa-check-circle"></i> Verified Purchase</span>
                            </h4>
                            <span>${date}</span>
                        </div>
                    </div>
                    <div class="review-star">${stars}</div>
                </div>
                <p class="review-text">${r.reviewText}</p>
            </div>
        `;
    });
    reviewsList.innerHTML = html;
}

function filterReviews(rating, event) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    
    currentReviewFilter = rating;
    
    let filtered;
    if (rating === 'all') {
        filtered = allReviews;
    } else {
        filtered = allReviews.filter(r => r.rating === parseInt(rating));
    }
    
    if (filtered.length === 0) {
        document.getElementById('reviews-list').innerHTML = `
            <div class="no-reviews">
                <i class="fa-regular fa-star"></i>
                <h3>No ${rating}-star reviews</h3>
                <p>Try a different filter or be the first to leave one!</p>
            </div>
        `;
        return;
    }
    
    renderReviewCards(filtered);
}

function toggleReviewForm() {
    const form = document.getElementById('review-form-container');
    if (!form) return;
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    if (form.style.display === 'block') {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

async function submitReview(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    const reviewerName = form.querySelector('input[name="reviewerName"]').value.trim();
    const rating = form.querySelector('input[name="rating"]:checked')?.value;
    const reviewText = form.querySelector('textarea[name="reviewText"]').value.trim();
    
    if (!reviewerName || !rating || !reviewText) {
        showReviewToast('Please fill in all fields!', 'error');
        return;
    }
    
    submitBtn.innerHTML = 'Posting... <i class="fa-solid fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;
    
    try {
        const res = await fetch('http://localhost:5000/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: currentProductId,
                reviewerName: reviewerName,
                rating: parseInt(rating),
                reviewText: reviewText
            })
        });
        
        const data = await res.json();
        
        if (data.success) {
            showReviewToast('✅ Thank you! Your review is now live.', 'success');
            form.reset();
            // Hide form
            document.getElementById('review-form-container').style.display = 'none';
            // Reload reviews to show the new one
            loadReviews(currentProductId);
            // Scroll to reviews
            setTimeout(() => {
                document.querySelector('.reviews-overview').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 500);
        } else {
            showReviewToast('Failed to submit. Please try again.', 'error');
        }
    } catch (err) {
        console.error(err);
        showReviewToast('Connection error. Is the backend running?', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Toast notification helper
function showReviewToast(message, type) {
    let toast = document.getElementById('review-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'review-toast';
        toast.className = 'review-toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = 'review-toast ' + type;
    toast.classList.add('show');
    
    setTimeout(() => toast.classList.remove('show'), 3500);
}