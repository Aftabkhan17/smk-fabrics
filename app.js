// =============================================================
// SMK FABRICS - APPLICATION STATE ENGINE
// =============================================================
let shoppingCart = [];
let activeDiscountMultiplier = 0.0; // Starts at 0% off
let currentAppliedCode = "";

// Initialize page events once the web browser screen mounts
document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromBackend();
});

/**
 * PHASE 2: Fetch products dynamically from our local backend server API
 */
function loadProductsFromBackend() {
    const gridContainer = document.getElementById('dynamic-fabric-grid');

    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            gridContainer.innerHTML = ''; // Wipe out baseline static template markers

            products.forEach(product => {
                const cardHTML = `
                    <div class="product-card" data-id="${product.id}" data-base-price="${product.basePricePerMeter}">
                        <div class="img-container">
                            <img src="${product.image}" alt="${product.title}">
                        </div>
                        <div class="product-details">
                            <span class="mill-brand">${product.brand}</span>
                            <h3 class="product-title">${product.title}</h3>
                            <p class="product-price">
                                From <span>₹</span> 
                                <span class="calculated-price">${(product.basePricePerMeter * 2.5).toFixed(2)}</span> 
                                <span class="price-unit">/ per cut</span>
                            </p>
                            
                            <div class="fabric-length-selector">
                                <label>Select Cut Length:</label>
                                <select class="length-dropdown" onchange="updateCardPrice(this)">
                                    <option value="1.5">1.5 Meters (Half Shirt)</option>
                                    <option value="2.5" selected>2.5 Meters (Full Shirt)</option>
                                    <option value="3.0">3.0 Meters (Long Kurta)</option>
                                </select>
                            </div>
                            <button class="btn-add-to-cart" onclick="handleAddToCart(this)">Add To Shopping Cart</button>
                        </div>
                    </div>
                `;
                gridContainer.innerHTML += cardHTML;
            });
        })
        .catch(err => {
            console.error("Error connecting with SMK Fabrics server:", err);
            gridContainer.innerHTML = `<p style="color:red; text-align:center;">Failed to load item collections from database.</p>`;
        });
}

/**
 * Updates individual card calculation numbers dynamically on user dropdown selection shifts
 */
function updateCardPrice(dropdown) {
    const selectedLength = parseFloat(dropdown.value);
    const card = dropdown.closest('.product-card');
    const basePrice = parseFloat(card.getAttribute('data-base-price'));
    const priceDisplay = card.querySelector('.calculated-price');
    
    const dynamicTotal = basePrice * selectedLength;
    priceDisplay.textContent = dynamicTotal.toFixed(2);
}

/**
 * Pushes product values safely into our shoppingCart storage array structure
 */
function handleAddToCart(buttonElement) {
    const card = buttonElement.closest('.product-card');
    const id = card.getAttribute('data-id');
    const title = card.querySelector('.product-title').textContent;
    const selectedLength = card.querySelector('.length-dropdown').value;
    const finalPrice = card.querySelector('.calculated-price').textContent;
    const badge = document.getElementById('cart-badge');

    // Create item item tracker format object metadata
    const productPayload = {
        id: id,
        title: title,
        meters: parseFloat(selectedLength),
        price: parseFloat(finalPrice)
    };

    // Push into our global cart state array
    shoppingCart.push(productPayload);
    badge.textContent = shoppingCart.length;

    // Visual button interaction state changes
    buttonElement.textContent = "Added ✓";
    buttonElement.style.backgroundColor = "#b38f4f"; // Accent gold
    
    setTimeout(() => {
        buttonElement.textContent = "Add To Shopping Cart";
        buttonElement.style.backgroundColor = "#1a3a2a"; // Primary green
    }, 1200);

    // If the sidebar drawer is already open on-screen, update its item view immediately
    const drawer = document.getElementById('cart-drawer');
    if (drawer.classList.contains('active')) {
        renderCartItems();
    }
}

// =============================================================
// PHASE 3: DRAWER CONTROL & MATHEMATICS ENGINES
// =============================================================

/**
 * Toggles class visibility trackers to slide the drawer out or off screen boundaries
 */
function toggleCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    drawer.classList.toggle('active');
    
    // Automatically redraw selected lists on active panel visibility transitions
    if (drawer.classList.contains('active')) {
        renderCartItems();
    }
}

/**
 * Re-reads our shoppingCart array records to paint actual list item elements into the HTML
 */
function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const subtotalDisplay = document.getElementById('cart-subtotal-amount');
    const discountDisplay = document.getElementById('cart-discount-amount');
    const totalDisplay = document.getElementById('cart-total-amount');
    const discountRow = document.getElementById('discount-row');
    const codeNameDisplay = document.getElementById('applied-code-name');
    
    // If empty, clean up billing layouts and short-circuit
    if (shoppingCart.length === 0) {
        container.innerHTML = `<p class="empty-cart-msg">Your cart is currently empty.</p>`;
        subtotalDisplay.textContent = "0.00";
        totalDisplay.textContent = "0.00";
        discountRow.classList.add('hidden');
        resetCouponUI();
        return;
    }

    container.innerHTML = '';
    let rollingSubtotal = 0;

    // Map rows into view
    shoppingCart.forEach((item, index) => {
        rollingSubtotal += item.price;
        
        const rowHTML = `
            <div class="cart-item-row">
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p class="cart-item-meta">Cut Length: <strong>${item.meters} Meters</strong></p>
                    <button class="btn-remove-item" onclick="removeCartItem(${index})">Remove item</button>
                </div>
                <div class="cart-item-price">
                    ₹${item.price.toFixed(2)}
                </div>
            </div>
        `;
        container.innerHTML += rowHTML;
    });

    // Run promotional calculation math equations
    let calculatedDeduction = rollingSubtotal * activeDiscountMultiplier;
    let finalGrandTotal = rollingSubtotal - calculatedDeduction;

    // Toggle promotional presentation fields depending on coupon data values
    if (activeDiscountMultiplier > 0) {
        codeNameDisplay.textContent = currentAppliedCode;
        discountDisplay.textContent = calculatedDeduction.toFixed(2);
        discountRow.classList.remove('hidden');
    } else {
        discountRow.classList.add('hidden');
    }

    subtotalDisplay.textContent = rollingSubtotal.toFixed(2);
    totalDisplay.textContent = finalGrandTotal.toFixed(2);
}

/**
 * Removes chosen element arrays via coordinate indexes when user hits "Remove item"
 */
function removeCartItem(indexPosition) {
    shoppingCart.splice(indexPosition, 1);
    
    // Update navbar header icon badge numbers
    document.getElementById('cart-badge').textContent = shoppingCart.length;
    
    // Refresh visual listing outputs
    renderCartItems();
}

/**
 * Validates promo values against verified parameters
 */
function applyDiscountCode() {
    const inputField = document.getElementById('coupon-input');
    const messageBox = document.getElementById('coupon-message');
    const enteredCode = inputField.value.trim().toUpperCase();

    if (shoppingCart.length === 0) {
        messageBox.className = "coupon-message coupon-error";
        messageBox.textContent = "Please add premium fabrics to your cart first!";
        return;
    }

    // Checking code conditions matching our luxury targets
    if (enteredCode === "WELCOME5") {
        activeDiscountMultiplier = 0.05; // 5% Discount rate
        currentAppliedCode = "WELCOME5";
        messageBox.className = "coupon-message coupon-success";
        messageBox.textContent = "Success! 5% first order discount applied. 🎉";
    } else if (enteredCode === "JUNE10") {
        activeDiscountMultiplier = 0.10; // 10% Discount rate
        currentAppliedCode = "JUNE10";
        messageBox.className = "coupon-message coupon-success";
        messageBox.textContent = "Premium Code Active! 10% discount applied. 🔥";
    } else if (enteredCode === "JUNE15") {
        activeDiscountMultiplier = 0.15; // 15% Discount rate
        currentAppliedCode = "JUNE15";
        messageBox.className = "coupon-message coupon-success";
        messageBox.textContent = "VIP Code Active! 15% discount applied. 🔥";
    } else {
        activeDiscountMultiplier = 0.0;
        currentAppliedCode = "";
        messageBox.className = "coupon-message coupon-error";
        messageBox.textContent = "Invalid code. Try using WELCOME5, JUNE10, or JUNE15.";
    }

    renderCartItems();
}

/**
 * Resets coupon user interface entry flags
 */
function resetCouponUI() {
    activeDiscountMultiplier = 0.0;
    currentAppliedCode = "";
    const messageBox = document.getElementById('coupon-message');
    const inputField = document.getElementById('coupon-input');
    if (messageBox) messageBox.textContent = "";
    if (inputField) inputField.value = "";
}

/**
 * Checkout Action routing simulator alert systems
 */
function processCheckoutAlert() {
    if (shoppingCart.length === 0) {
        alert("Your shopping cart is completely empty!");
        return;
    }
    alert("📦 Order specifications packaged successfully!\nConnecting with global secure checkout payment arrays for SMK Fabrics...");
}

// =============================================================
// PHASE 4: RESPONSIVE MOBILE NAVIGATION
// =============================================================

/**
 * Toggles the responsive link display layer class across mobile format screen header states
 */
function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-links');
    navMenu.classList.toggle('mobile-active');
}
// Toggle Night Mode Theme
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}