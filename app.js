// Master Application Context State Machine
let productsDataset = [];
let shoppingCart = [];
let activeDiscountMultiplier = 0.0;
let currentAppliedCode = "";

document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromBackend();
});

/**
 * FETCH LAYER: Queries server clusters to fetch advanced product structures
 */
function loadProductsFromBackend() {
    const gridContainer = document.getElementById('dynamic-fabric-grid');
    
    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            productsDataset = products; // Save globally to memory to drive instant filtering loops
            renderProductGrid(productsDataset);
            populateBrandFilters(productsDataset);
        })
        .catch(err => {
            console.error("UI Render Exception:", err);
            gridContainer.innerHTML = `<p class='error-msg'>Connection interrupted while fetching dataset. Check console logs.</p>`;
        });
}

/**
 * RENDER LAYER: Paints luxury fabric layouts with inline image slider navigation controls
 */
function renderProductGrid(items) {
    const gridContainer = document.getElementById('dynamic-fabric-grid');
    gridContainer.innerHTML = '';
    
    if (items.length === 0) {
        gridContainer.innerHTML = `<p class='empty-search-msg'>No matching menswear fabrics found inside current configurations.</p>`;
        return;
    }
    
    items.forEach(product => {
        // Safe check: If the array string collection is broken, use a placeholder
        const imagesList = product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600'];
        
        // Loop and build the multi-image slide deck view
        let imageSlidesHTML = '';
        imagesList.forEach((imgUrl, index) => {
            imageSlidesHTML += `<img src="images/siyaram charcoalgrey suiting.jpg" alt="Siyaram Charcoal Grey Suiting">`;
        });
        
        // Loop and generate indicators dots based on array size markers
        let slideDotsHTML = '';
        imagesList.forEach((_, index) => {
            slideDotsHTML += `<span class="slide-dot ${index === 0 ? 'active' : ''}" onclick="switchActiveSlide(this, ${index})" data-index="${index}"></span>`;
        });

        const cardHTML = `
            <div class="product-card" data-id="${product.id}" data-base-price="${product.basePricePerMeter}" data-brand="${product.brand}">
                <div class="img-container">
                    <span class="brand-badge-tag">${product.brand}</span>
                    <div class="slides-wrapper-window">
                        ${imageSlidesHTML}
                    </div>
                    ${imagesList.length > 1 ? `<div class="slider-dot-indicators">${slideDotsHTML}</div>` : ''}
                </div>
                <div class="product-details">
                    <div class="technical-specs-row">
                        <span>🪡 ${product.specs?.weave || 'Premium Weave'}</span>
                        <span>🧵 ${product.specs?.blend || 'Fine Blend'}</span>
                    </div>
                    <h3 class="product-title">${product.title}</h3>
                    <div class="pricing-calculator-block">
                        <span class="calculated-output-price">₹<span class="calculated-price">${(product.basePricePerMeter * 2.5).toFixed(2)}</span></span>
                        <span class="unit-identifier-tag">/ 2.5 Meter Cut</span>
                    </div>
                    <div class="fabric-length-selector">
                        <label>Custom Tailoring Length Selection</label>
                        <select class="length-dropdown" onchange="updateCardPrice(this)">
                            <option value="1.5">1.5 Meters (Half Sleeve Shirt)</option>
                            <option value="2.5" selected>2.5 Meters (Full Sleeve Shirt)</option>
                            <option value="3.0">3.0 Meters (Long Traditional Kurta)</option>
                            <option value="4.0">4.0 Meters (Full Suit Set Length)</option>
                        </select>
                    </div>
                    <button class="btn-add-to-cart" onclick="handleAddToCart(this)">Add To Shopping Cart</button>
                </div>
            </div>
        `;
        gridContainer.innerHTML += cardHTML;
    });
}

/**
 * INTERACTIVE SLIDER LOGIC: Cycles localized sliding canvas frames smoothly
 */
function switchActiveSlide(dotElement, targetIndex) {
    const card = dotElement.closest('.product-card');
    const slides = card.querySelectorAll('.slide-img');
    const dots = card.querySelectorAll('.slide-dot');
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[targetIndex].classList.add('active');
    dots[targetIndex].classList.add('active');
}

/**
 * UX DYNAMIC FILTER CORES: Filters products locally by brand choice instantly
 */
function populateBrandFilters(products) {
    const filterContainer = document.getElementById('brand-filters-wrapper');
    if (!filterContainer) return;
    
    // Grab all unique brands out of the incoming database documents array mapping
    const uniqueBrands = ['All Brands', ...new Set(products.map(p => p.brand))];
    
    filterContainer.innerHTML = '';
    uniqueBrands.forEach(brand => {
        const tabElement = document.createElement('button');
        tabElement.className = `filter-chip-tab ${brand === 'All Brands' ? 'active' : ''}`;
        tabElement.textContent = brand;
        tabElement.onclick = () => {
            document.querySelectorAll('.filter-chip-tab').forEach(btn => btn.classList.remove('active'));
            tabElement.classList.add('active');
            
            const filteredResults = brand === 'All Brands' 
                ? productsDataset 
                : productsDataset.filter(p => p.brand === brand);
                
            renderProductGrid(filteredResults);
        };
        filterContainer.appendChild(tabElement);
    });
}

function updateCardPrice(dropdown) {
    const selectedLength = parseFloat(dropdown.value);
    const card = dropdown.closest('.product-card');
    const basePrice = parseFloat(card.getAttribute('data-base-price'));
    const priceDisplay = card.querySelector('.calculated-price');
    const labelDisplay = card.querySelector('.unit-identifier-tag');
    
    const dynamicTotal = basePrice * selectedLength;
    priceDisplay.textContent = dynamicTotal.toFixed(2);
    labelDisplay.textContent = `/ ${selectedLength} Meter Cut`;
}

function handleAddToCart(buttonElement) {
    const card = buttonElement.closest('.product-card');
    const id = card.getAttribute('data-id');
    const title = card.querySelector('.product-title').textContent;
    const brand = card.getAttribute('data-brand');
    const selectedLength = card.querySelector('.length-dropdown').value;
    const finalPrice = card.querySelector('.calculated-price').textContent;
    const badge = document.getElementById('cart-badge');
    
    const productPayload = {
        id: id,
        title: `[${brand}] ${title}`,
        meters: parseFloat(selectedLength),
        price: parseFloat(finalPrice)
    };
    
    shoppingCart.push(productPayload);
    badge.textContent = shoppingCart.length;
    
    buttonElement.textContent = "Added ✓";
    buttonElement.style.backgroundColor = "#b38f4f"; // Smooth premium transformation gold feedback
    
    setTimeout(() => {
        buttonElement.textContent = "Add To Shopping Cart";
        buttonElement.style.backgroundColor = "var(--primary-green)";
    }, 1200);
    
    if (document.getElementById('cart-drawer').classList.contains('active')) {
        renderCartItems();
    }
}

function toggleCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    drawer.classList.toggle('active');
    if (drawer.classList.contains('active')) {
        renderCartItems();
    }
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const subtotalDisplay = document.getElementById('cart-subtotal-amount');
    const discountDisplay = document.getElementById('cart-discount-amount');
    const totalDisplay = document.getElementById('cart-total-amount');
    const discountRow = document.getElementById('discount-row');
    const codeNameDisplay = document.getElementById('applied-code-name');
    
    if (shoppingCart.length === 0) {
        container.innerHTML = `<p class="empty-cart-msg">Your shopping drawer is currently empty.</p>`;
        subtotalDisplay.textContent = "0.00";
        totalDisplay.textContent = "0.00";
        discountRow.classList.add('hidden');
        resetCouponUI();
        return;
    }
    
    container.innerHTML = '';
    let rollingSubtotal = 0;
    
    shoppingCart.forEach((item, index) => {
        rollingSubtotal += item.price;
        const rowHTML = `
            <div class="cart-item-row">
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p class="cart-item-meta">Length ordered: ${item.meters} Meters</p>
                    <button class="btn-remove-item" onclick="removeCartItem(${index})">Remove item</button>
                </div>
                <span class="cart-item-price">₹${item.price.toFixed(2)}</span>
            </div>
        `;
        container.innerHTML += rowHTML;
    });
    
    let calculatedDeduction = rollingSubtotal * activeDiscountMultiplier;
    let finalGrandTotal = rollingSubtotal - calculatedDeduction;
    
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

function removeCartItem(indexPosition) {
    shoppingCart.splice(indexPosition, 1);
    document.getElementById('cart-badge').textContent = shoppingCart.length;
    renderCartItems();
}

function applyDiscountCode() {
    const inputField = document.getElementById('coupon-input');
    const messageBox = document.getElementById('coupon-message');
    const enteredCode = inputField.value.trim().toUpperCase();
    
    if (shoppingCart.length === 0) {
        messageBox.className = "coupon-message coupon-error";
        messageBox.textContent = "Please add dynamic fabric items before applying coupons!";
        return;
    }
    
    if (enteredCode === "WELCOME5") {
        activeDiscountMultiplier = 0.05;
        currentAppliedCode = "WELCOME5";
        messageBox.className = "coupon-message coupon-success";
        messageBox.textContent = "Success! 5% baseline code markdown active. 🎉";
    } else if (enteredCode === "JUNE10") {
        activeDiscountMultiplier = 0.10;
        currentAppliedCode = "JUNE10";
        messageBox.className = "coupon-message coupon-success";
        messageBox.textContent = "Luxury Markdown! 10% discount applied. 🔥";
    } else if (enteredCode === "JUNE15") {
        activeDiscountMultiplier = 0.15;
        currentAppliedCode = "JUNE15";
        messageBox.className = "coupon-message coupon-success";
        messageBox.textContent = "VIP Allocation Verified! 15% discount applied. 👑";
    } else {
        activeDiscountMultiplier = 0.0;
        currentAppliedCode = "";
        messageBox.className = "coupon-message coupon-error";
        messageBox.textContent = "Invalid tracking token. Try checking code string parameters.";
    }
    renderCartItems();
}

function resetCouponUI() {
    activeDiscountMultiplier = 0.0;
    currentAppliedCode = "";
    const messageBox = document.getElementById('coupon-message');
    const inputField = document.getElementById('coupon-input');
    if (messageBox) messageBox.textContent = "";
    if (inputField) inputField.value = "";
}

function processCheckoutAlert() {
    if (shoppingCart.length === 0) {
        alert("Your e-commerce drawer is empty!");
        return;
    }
    alert("📦 Production processing data arrays compiled successfully!\nConnecting seamlessly with secure Razorpay/Stripe networks loop...");
}

function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-links');
    navMenu.classList.toggle('mobile-active');
}