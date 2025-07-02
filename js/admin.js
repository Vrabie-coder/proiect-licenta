// admin.js

// 1. Definim credențialele de administrator
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password";
let currentEditingProductId = null; // Va reține ID-ul produsului pe care îl edităm

// Funcție pentru a verifica dacă utilizatorul este logat
function isLoggedIn() {
    return localStorage.getItem('loggedInUser') === ADMIN_USERNAME;
}

// Funcție pentru a loga utilizatorul
function loginUser(username, password) {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('loggedInUser', ADMIN_USERNAME);
        showAlert("Autentificare reușită!");
        setTimeout(() => {
            window.location.href = 'admin.html'; // Redirecționează către panoul de administrare
        }, 1500);
        return true;
    } else {
        showAlert("Nume de utilizator sau parolă incorecte!");
        return false;
    }
}

// Funcții pentru modala de Adăugare/Editare Produs
function openProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    const submitButton = document.getElementById('product-form-submit');
    const form = document.getElementById('product-form');
    const productIdInput = document.getElementById('product-id');
    const nameInput = document.getElementById('product-name');
    const descriptionInput = document.getElementById('product-description');
    const priceInput = document.getElementById('product-price');
    const imageInput = document.getElementById('product-image');
    const errorMessage = document.getElementById('product-form-error');

    form.reset();
    errorMessage.textContent = '';
    currentEditingProductId = null;

    if (product) {
        title.textContent = 'Editează Produs';
        submitButton.textContent = 'Salvează Modificările';
        productIdInput.value = product.id;
        nameInput.value = product.name;
        descriptionInput.value = product.description;
        priceInput.value = product.price;
        imageInput.value = product.image;
        currentEditingProductId = product.id;
    } else {
        title.textContent = 'Adaugă Produs Nou';
        submitButton.textContent = 'Adaugă Produs';
        productIdInput.value = '';
    }

    modal.classList.add('show');
    nameInput.focus();
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('show');
    document.getElementById('product-form').reset();
    currentEditingProductId = null;
}

// Funcție pentru a obține toate produsele
function getProducts() {
    return JSON.parse(localStorage.getItem('products')) || [];
}

// Funcție pentru a salva produsele (după o modificare)
function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
}

// Funcție pentru a adăuga/edita un produs
function saveProduct(product) {
    let products = getProducts();
    if (product.id) {
        const index = products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            products[index] = product;
        }
    } else {
        product.id = 'prod_' + Date.now().toString();
        products.push(product);
    }
    saveProducts(products);
    displayAdminProducts();
    showAlert("Produs salvat cu succes!");
    closeProductModal();
}

// Funcție pentru a șterge un produs
function deleteProduct(productId) {
    let products = getProducts();
    showAlert(
        "Sunteți sigur că doriți să ștergeți acest produs?",
        "confirm",
        () => {
            products = products.filter(p => p.id !== productId);
            saveProducts(products);
            displayAdminProducts();
            showAlert("Produs șters cu succes!");
        },
        () => {
            showAlert("Ștergerea produsului a fost anulată.");
        }
    );
}

// Funcție pentru a deloga utilizatorul
function logoutUser() {
    localStorage.removeItem('loggedInUser');
    showAlert("Ați fost deconectat.");
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Inițializăm produsele default DOAR O SINGURĂ DATĂ
function initializeDefaultProductsIfEmpty() {
    const products = getProducts();
    if (products.length === 0) {
        const defaultProducts = [{
            id: 'prod_1',
            name: 'Miere de Salcâm/kg',
            description: 'Miere pură de salcâm, recoltată din flora bogată a luncilor.',
            price: 40.00,
            image: 'img/Miere_salcam.jpg'
        }, {
            id: 'prod_2',
            name: 'Miere Polifloră/kg',
            description: 'Un amestec delicios de nectar de la diverse flori, cu o aromă bogată.',
            price: 25.00,
            image: 'img/Miere_poliflora.jpg'
        }, {
            id: 'prod_3',
            name: 'Miere de Fâneață/kg',
            description: 'Miere cu aromă de flori de dealuri și podișuri.',
            price: 30.00,
            image: 'img/Miere_faneata.jpg'
        }, {
            id: 'prod_4',
            name: 'Miere de Mană/kg',
            description: 'Miere de pădure, culoare închisă și gust intens, bogată în minerale.',
            price: 35.00,
            image: 'img/Miere_mana.jpg'
        }, ];
        saveProducts(defaultProducts);
        console.log("Produse default inițializate în localStorage.");
    }
}

// Funcție pentru a afișa produsele în panoul de administrare
function displayAdminProducts() {
    const products = getProducts();
    const productListAdmin = document.getElementById('product-list-admin');

    if (!productListAdmin) return;

    productListAdmin.innerHTML = '';

    if (products.length === 0) {
        productListAdmin.innerHTML = '<p class="error-message" style="width: 100%; text-align: center;">Niciun produs disponibil. Adaugă produse folosind butonul de mai sus.</p>';
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card', 'admin-product-card');

        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>${product.description}</p>
            <p class="price">${product.price.toFixed(2)} RON</p>
            <div class="admin-actions">
                <button class="btn-primary edit-product-btn" data-id="${product.id}">Editează</button>
                <button class="btn-secondary delete-product-btn" data-id="${product.id}">Șterge</button>
            </div>
        `;
        productListAdmin.appendChild(productCard);
    });
}

// ************* NOU: Funcții pentru gestionarea COMENZILOR în panoul de administrare *************

// Funcție pentru a obține toate comenzile (definită și în cart.js, dar o punem și aici pentru admin)
function getOrders() {
    return JSON.parse(localStorage.getItem('orders')) || [];
}

// Funcție pentru a salva comenzile
function saveOrders(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Funcție pentru a afișa comenzile în panoul de administrare
function displayAdminOrders() {
    const orders = getOrders();
    const orderListAdmin = document.getElementById('order-list-admin');

    if (!orderListAdmin) {
        console.warn('Elementul #order-list-admin nu a fost găsit. Nu se pot afișa comenzile.');
        return;
    }

    orderListAdmin.innerHTML = '';

    if (orders.length === 0) {
        orderListAdmin.innerHTML = '<p class="info-message" style="width: 100%; text-align: center;">Nicio comandă plasată încă.</p>';
        return;
    }

    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.classList.add('order-card');

        const itemsHtml = order.items.map(item => `
            <li>${item.name} (x${item.quantity}) - ${(item.price * item.quantity).toFixed(2)} RON</li>
        `).join('');

        orderCard.innerHTML = `
            <h3>Comanda ID: ${order.id}</h3>
            <p><strong>Client:</strong> ${order.customerName}</p>
            <p><strong>Telefon:</strong> ${order.customerPhone}</p>
            <p><strong>Adresă:</strong> ${order.customerAddress}</p>
            <p><strong>Data:</strong> ${order.date}</p>
            <p><strong>Status:</strong> <span class="order-status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span></p>
            <h4>Produse comandate:</h4>
            <ul>${itemsHtml}</ul>
            <p class="order-total"><strong>Total:</strong> ${order.total.toFixed(2)} RON</p>
            <div class="order-actions">
                <select class="order-status-select" data-id="${order.id}">
                    <option value="În așteptare" ${order.status === 'În așteptare' ? 'selected' : ''}>În așteptare</option>
                    <option value="Procesată" ${order.status === 'Procesată' ? 'selected' : ''}>Procesată</option>
                    <option value="Finalizată" ${order.status === 'Finalizată' ? 'selected' : ''}>Finalizată</option>
                    <option value="Anulată" ${order.status === 'Anulată' ? 'selected' : ''}>Anulată</option>
                </select>
                <button class="btn-secondary delete-order-btn" data-id="${order.id}">Șterge Comanda</button>
            </div>
        `;
        orderListAdmin.appendChild(orderCard);
    });

    orderListAdmin.querySelectorAll('.order-status-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const orderId = e.target.dataset.id;
            const newStatus = e.target.value;
            updateOrderStatus(orderId, newStatus);
        });
    });

    orderListAdmin.querySelectorAll('.delete-order-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const orderId = e.target.dataset.id;
            deleteOrder(orderId);
        });
    });
}

// Funcție pentru a actualiza statusul unei comenzi
function updateOrderStatus(orderId, newStatus) {
    let orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        saveOrders(orders);
        displayAdminOrders();
        showAlert(`Statusul comenzii ${orderId} a fost actualizat la "${newStatus}".`);
    }
}

// Funcție pentru a șterge o comandă
function deleteOrder(orderId) {
    showAlert(
        `Sunteți sigur că doriți să ștergeți comanda ${orderId}? Această acțiune este ireversibilă.`,
        "confirm",
        () => {
            let orders = getOrders();
            orders = orders.filter(o => o.id !== orderId);
            saveOrders(orders);
            displayAdminOrders();
            showAlert(`Comanda ${orderId} a fost ștearsă.`);
        },
        () => {
            showAlert("Ștergerea comenzii a fost anulată.");
        }
    );
}

// Nota: funcția showAlert este definită în cart.js. Ne asigurăm că e disponibilă.
// Ideal ar fi într-un fișier utilitar separat (ex: utils.js).

// 2. Logică pentru afișarea/ascunderea link-ului de admin/logout în navigație
document.addEventListener('DOMContentLoaded', () => {
    const adminLinkContainer = document.getElementById('admin-link-container');
    if (adminLinkContainer) {
        if (isLoggedIn()) {
            adminLinkContainer.innerHTML = '<li><a href="#" id="logout-nav-btn">Deconectare</a></li>';
            document.getElementById('logout-nav-btn').addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
            });
        } else {
            if (window.location.pathname.indexOf('login.html') === -1 && window.location.pathname.indexOf('admin.html') === -1) {
                adminLinkContainer.innerHTML = '<li><a href="login.html">Login Admin</a></li>';
            }
        }
    }

    // Logică specifică paginii de LOGIN
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMessageElement = document.getElementById('login-error-message');

            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                localStorage.setItem('loggedInUser', ADMIN_USERNAME);
                showAlert("Autentificare reușită!");
                errorMessageElement.textContent = '';
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1500);
            } else {
                errorMessageElement.textContent = "Nume de utilizator sau parolă incorecte!";
                showAlert("Nume de utilizator sau parolă incorecte!");
            }
        });
    }

    // Logică specifică paginii de ADMIN
    const adminPanel = document.querySelector('.admin-panel');
    if (adminPanel) {
        if (!isLoggedIn()) {
            showAlert("Nu sunteți autentificat ca administrator! Redirecționare către pagina de login.");
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        initializeDefaultProductsIfEmpty();

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logoutUser);
        }

        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => openProductModal());
        }

        const productModalClose = document.getElementById('product-modal-close');
        if (productModalClose) {
            productModalClose.addEventListener('click', closeProductModal);
        }

        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const productId = document.getElementById('product-id').value;
                const name = document.getElementById('product-name').value.trim();
                const description = document.getElementById('product-description').value.trim();
                const price = parseFloat(document.getElementById('product-price').value);
                const image = document.getElementById('product-image').value.trim();
                const errorMessage = document.getElementById('product-form-error');

                if (name === '' || description === '' || isNaN(price) || price < 0 || image === '') {
                    errorMessage.textContent = 'Toate câmpurile sunt obligatorii și prețul trebuie să fie un număr pozitiv.';
                    return;
                }

                const productData = {
                    id: productId,
                    name,
                    description,
                    price,
                    image
                };

                saveProduct(productData);
            });
        }

        const productListAdmin = document.getElementById('product-list-admin');
        if (productListAdmin) {
            productListAdmin.addEventListener('click', (e) => {
                if (e.target.classList.contains('edit-product-btn')) {
                    const productId = e.target.dataset.id;
                    const products = getProducts();
                    const productToEdit = products.find(p => p.id === productId);
                    if (productToEdit) {
                        openProductModal(productToEdit);
                    }
                } else if (e.target.classList.contains('delete-product-btn')) {
                    const productId = e.target.dataset.id;
                    deleteProduct(productId);
                }
            });
        }

        displayAdminProducts();
        displayAdminOrders(); // NOU: Afișează comenzile în admin panel
    }
});