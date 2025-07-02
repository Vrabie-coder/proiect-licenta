// js/cart.js

// 1. Funcție pentru a obține coșul curent din Local Storage
function getCart() {
    return JSON.parse(localStorage.getItem('shoppingCart')) || [];
}

// 2. Funcție pentru a salva coșul în Local Storage
function saveCart(cart) {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

// Funcție generală de alertă/confirmare (mutată aici, poate fi și în util.js)
function showAlert(message, type = 'alert', onConfirm = null, onCancel = null) {
    const modal = document.getElementById('custom-alert-modal');
    const alertMessage = document.getElementById('alert-message');
    const okButton = document.getElementById('alert-ok-button');
    const closeButton = modal ? modal.querySelector('.close-button') : null;
    let cancelButton = document.getElementById('alert-cancel-button');

    if (!modal || !alertMessage || !okButton) {
        console.error('Elemente lipsă pentru modala de alertă/confirmare! Folosind fallback alert/confirm.');
        if (type === 'confirm') {
            if (confirm(message)) { if (onConfirm) onConfirm(); } else { if (onCancel) onCancel(); }
        } else {
            alert(message);
        }
        return;
    }

    // Creează butonul de anulare dacă nu există și e necesar
    if (!cancelButton && okButton && okButton.parentNode) {
        cancelButton = document.createElement('button');
        cancelButton.id = 'alert-cancel-button';
        cancelButton.classList.add('btn-secondary');
        cancelButton.textContent = 'Anulează';
        okButton.parentNode.insertBefore(cancelButton, okButton.nextSibling);
    }
    if (!cancelButton && type === 'confirm') {
        console.warn('Butonul de anulare nu a putut fi creat. Confirmarea va folosi prompt-ul browserului.');
        if (confirm(message)) { if (onConfirm) onConfirm(); } else { if (onCancel) onCancel(); }
        return;
    }

    alertMessage.textContent = message;

    okButton.onclick = null;
    if (cancelButton) cancelButton.onclick = null;
    if (closeButton) closeButton.onclick = null;

    okButton.style.display = 'inline-block';
    if (cancelButton) cancelButton.style.display = 'none';

    const closeAlert = () => {
        modal.classList.remove('show');
        window.removeEventListener('click', clickOutsideAlert);
    };

    if (type === 'confirm') {
        if (cancelButton) cancelButton.style.display = 'inline-block';
        okButton.textContent = 'Confirmă';

        okButton.onclick = () => { closeAlert(); if (onConfirm) onConfirm(); };
        if (cancelButton) cancelButton.onclick = () => { closeAlert(); if (onCancel) onCancel(); };
        if (closeButton) closeButton.onclick = () => { closeAlert(); if (onCancel) onCancel(); };
    } else {
        okButton.textContent = 'OK';
        okButton.onclick = closeAlert;
        if (closeButton) closeButton.onclick = closeAlert;
    }

    modal.classList.add('show');

    const clickOutsideAlert = (event) => {
        if (event.target === modal) {
            closeAlert();
            if (type === 'confirm' && onCancel) onCancel();
        }
    };
    window.removeEventListener('click', clickOutsideAlert);
    window.addEventListener('click', clickOutsideAlert);
}

// Functie pentru a afișa modala de prompt pentru comandă
function showOrderPrompt() {
    const modal = document.getElementById('order-prompt-modal');
    const customerNameInput = document.getElementById('customer-name-input');
    const customerPhoneInput = document.getElementById('customer-phone-input'); // NOU
    const customerAddressInput = document.getElementById('customer-address-input'); // NOU
    const submitButton = document.getElementById('order-prompt-submit');
    const cancelButton = document.getElementById('order-prompt-cancel');
    const closeButton = document.getElementById('order-prompt-close');
    const errorMessage = document.getElementById('order-prompt-error');

    if (!modal || !customerNameInput || !customerPhoneInput || !customerAddressInput || !submitButton || !cancelButton || !closeButton || !errorMessage) {
        console.error('Elemente lipsă pentru modala de comandă!');
        return;
    }

    // Resetăm starea modalei
    customerNameInput.value = '';
    customerPhoneInput.value = ''; // Reset NOU
    customerAddressInput.value = ''; // Reset NOU
    errorMessage.textContent = '';
    modal.classList.add('show');

    setTimeout(() => customerNameInput.focus(), 100);

    const handleSubmit = () => {
        const customerName = customerNameInput.value.trim();
        const customerPhone = customerPhoneInput.value.trim(); // NOU
        const customerAddress = customerAddressInput.value.trim(); // NOU

        if (customerName === '' || customerPhone === '' || customerAddress === '') {
            errorMessage.textContent = 'Toate câmpurile sunt obligatorii (Nume, Telefon, Adresă)!';
            return;
        }

        // --- Adaugă această nouă verificare pentru numărul de telefon ---
        // Folosim o expresie regulată simplă pentru a verifica dacă sunt doar cifre și exact 10
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(customerPhone)) {
            errorMessage.textContent = 'Numărul de telefon trebuie să conțină exact 10 cifre!';
            return;
        }
        // -----------------------------------------------------------------

        closeOrderPrompt();
        // Trimitem toate datele colectate funcției de plasare a comenzii
        simulateOrderPlacement(customerName, customerPhone, customerAddress);
    };

    const handleCancel = () => {
        closeOrderPrompt();
        showAlert("Comanda a fost anulată.");
    };

    const closeOrderPrompt = () => {
        modal.classList.remove('show');
        submitButton.removeEventListener('click', handleSubmit);
        cancelButton.removeEventListener('click', handleCancel);
        closeButton.removeEventListener('click', handleCancel);
        window.removeEventListener('click', clickOutsideOrderPrompt);
        customerNameInput.removeEventListener('keypress', handleKeyPress);
        customerPhoneInput.removeEventListener('keypress', handleKeyPress); // NOU
        customerAddressInput.removeEventListener('keypress', handleKeyPress); // NOU (pentru Enter)
    };

    submitButton.addEventListener('click', handleSubmit);
    cancelButton.addEventListener('click', handleCancel);
    closeButton.addEventListener('click', handleCancel);

    const handleKeyPress = (event) => {
        if (event.key === 'Escape') {
            handleCancel();
        } else if (event.key === 'Enter') {
            // Dacă Enter este apăsat pe un câmp de input, se încearcă submit
            if (document.activeElement === customerNameInput || document.activeElement === customerPhoneInput || document.activeElement === customerAddressInput) {
                handleSubmit();
            }
        }
    };
    customerNameInput.addEventListener('keypress', handleKeyPress);
    customerPhoneInput.addEventListener('keypress', handleKeyPress);
    customerAddressInput.addEventListener('keypress', handleKeyPress);


    const clickOutsideOrderPrompt = (event) => {
        if (event.target === modal) {
            handleCancel();
        }
    };
    window.addEventListener('click', clickOutsideOrderPrompt);
}

// Funcție pentru a adăuga un produs în coș
function addToCart(product) { // Acum primește obiectul product direct
    let cart = getCart();

    let found = false;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === product.id) {
            cart[i].quantity++;
            found = true;
            break;
        }
    }

    if (!found) {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image, // Asigură-te că imaginea este inclusă
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartDisplay();
    updateCartItemCount();
    showAlert(`${product.name} a fost adăugat în coș!`);
}

// Funcție pentru a elimina un produs complet din coș
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartDisplay();
    updateCartItemCount();
}

// Funcție pentru a goli complet coșul
function clearCart() {
    localStorage.removeItem('shoppingCart');
    updateCartDisplay();
    updateCartItemCount();
}

// Funcție pentru a actualiza afișajul vizual al coșului pe pagina cos.html
function updateCartDisplay() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');

    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';

        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Coșul de cumpărături este gol.</p>';
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');

                itemElement.innerHTML = `
                    <div class="cart-item-details">
                        <span>${item.name} (x${item.quantity})</span>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)} RON</span>
                    <button class="remove-from-cart-btn" data-product-id="${item.id}">Șterge</button>
                `;
                cartItemsContainer.appendChild(itemElement);
                total += item.price * item.quantity;
            });
        }
        if (cartTotalElement) {
            cartTotalElement.textContent = total.toFixed(2);
        }
    }
}

// Funcție pentru a actualiza contorul de produse din header
function updateCartItemCount() {
    const cart = getCart();
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-item-count');
    if (cartCountElement) {
        cartCountElement.textContent = itemCount;
    }
}

// Funcția pentru a obține toate comenzile din Local Storage
function getOrders() {
    return JSON.parse(localStorage.getItem('orders')) || [];
}

// Funcția pentru a salva comenzile în Local Storage
function saveOrders(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Funcția pentru simularea plasării comenzii - SALVEAZĂ ÎN LOCAL STORAGE PENTRU ADMIN
function simulateOrderPlacement(customerName, customerPhone, customerAddress) { // NOU: primește telefon și adresă
    const cart = getCart();

    if (cart.length === 0) {
        showAlert("Coșul de cumpărături este gol! Adaugă produse înainte de a plasa o comandă.");
        return;
    }

    const orderDetails = {
        id: 'ORDER_' + Date.now().toString(), // ID unic pentru comandă
        customerName: customerName,
        customerPhone: customerPhone, // NOU
        customerAddress: customerAddress, // NOU
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        date: new Date().toLocaleString(),
        status: 'În așteptare' // Status inițial al comenzii
    };

    // Obține comenzile existente, adaugă noua comandă și salvează
    const orders = getOrders();
    orders.push(orderDetails);
    saveOrders(orders); // Salvează comenzile în Local Storage

    console.log("DETALII COMANDĂ PLASATĂ:", orderDetails);
    showAlert(`Comanda dumneavoastră a fost plasată cu succes, ${customerName}! Veți fi contactat în curând la ${customerPhone}.`);

    clearCart(); // Golește coșul după plasarea comenzii
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inițializarea afișajului coșului și a contorului la încărcarea paginii
    updateCartDisplay();
    updateCartItemCount();

    // NOU: Apelăm funcția pentru a afișa produsele pe pagina produse.html (dacă este cazul)
    // Ne asigurăm că această funcție este apelată doar dacă elementul `products-grid` există
    // Aceasta presupune că ai deja o funcție `displayProductsOnStorePage` undeva (e.g., în main.js sau chiar aici)
    const productsGridElement = document.getElementById('products-grid');
    if (productsGridElement && typeof displayProductsOnStorePage === 'function') {
        displayProductsOnStorePage();
    }


    // Delegare de evenimente pentru butoanele "Adaugă în Coș" de pe pagina de produse
    // (Presupunând că produsele sunt încărcate dinamic sau că butoanele au data-* atribute)
    document.body.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('add-to-cart-btn')) {
            // Colectează datele produsului de la butoanele data-set
            const product = {
                id: target.dataset.productId,
                name: target.dataset.productName,
                price: parseFloat(target.dataset.productPrice),
                image: target.dataset.productImage // Asigură-te că ai acest data-attribute
            };
            addToCart(product);
        }
    });

    // Event Listener pentru butoanele de "Șterge" din coș
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-from-cart-btn')) {
            const productId = event.target.dataset.productId;
            removeFromCart(productId);
        }
    });

    // Adaugă event listener pentru butonul "Golește Coșul"
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            showAlert(
                "Sunteți sigur că doriți să goliți coșul?",
                "confirm",
                clearCart,
                () => showAlert("Golirea coșului a fost anulată.")
            );
        });
    }

    // Adaugă event listener pentru butonul "Plasează Comanda"
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', showOrderPrompt);
    }
});


// NOU: Funcție pentru a afișa produsele pe pagina produse.html
// Este esențial ca această funcție să existe undeva și să fie apelată.
// Dacă nu ai main.js, o poți pune aici. Ideal ar fi într-un fișier dedicat afișării produselor pe site.
// Am mutat această funcție din cart.js, dacă vrei să ai o separare mai bună a responsabilităților,
// dar o las aici pentru compatibilitatea cu codul tău.
function displayProductsOnStorePage() {
    const productsGridElement = document.getElementById('products-grid');
    if (!productsGridElement) return;

    productsGridElement.innerHTML = '';

    // ATENȚIE: Aici apelăm getProducts() care ar trebui să fie definită.
    // Presupunem că e în admin.js sau că o vei face globală.
    // Pentru a ne asigura că funcționează, o vom defini aici dacă nu e globală.
    const products = JSON.parse(localStorage.getItem('products')) || []; // Fallback local

    if (products.length === 0) {
        productsGridElement.innerHTML = '<p class="empty-cart-message" style="width: 100%; text-align: center;">Momentan nu sunt produse disponibile. Vă rugăm să reveniți mai târziu.</p>';
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="price">${product.price.toFixed(2)} RON</p>
            <button class="add-to-cart-btn"
                    data-product-id="${product.id}"
                    data-product-name="${product.name}"
                    data-product-price="${product.price.toFixed(2)}"
                    data-product-image="${product.image}">Adaugă în Coș</button>
        `;
        productsGridElement.appendChild(productCard);
    });
}