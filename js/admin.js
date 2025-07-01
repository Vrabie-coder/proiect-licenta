// admin.js

// 1. Definim credențialele de administrator
// ATENȚIE: Într-un proiect real, NU AȚI PĂSTRA CREDENȚIALELE AICI!
// Acestea ar fi stocate securizat pe un server și verificate prin API.
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

// admin.js (Continuare)

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

    // Resetare formular
    form.reset();
    errorMessage.textContent = '';
    currentEditingProductId = null; // Resetăm ID-ul produsului editat

    if (product) { // Mod de editare
        title.textContent = 'Editează Produs';
        submitButton.textContent = 'Salvează Modificările';
        productIdInput.value = product.id; // Setează ID-ul produsului (ascuns)
        nameInput.value = product.name;
        descriptionInput.value = product.description;
        priceInput.value = product.price;
        imageInput.value = product.image;
        currentEditingProductId = product.id; // Setăm ID-ul pentru editare
    } else { // Mod de adăugare
        title.textContent = 'Adaugă Produs Nou';
        submitButton.textContent = 'Adaugă Produs';
        productIdInput.value = '';
    }

    modal.classList.add('show');
    nameInput.focus(); // Focus pe primul câmp
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('show');
    document.getElementById('product-form').reset(); // Golește formularul la închidere
    currentEditingProductId = null; // Resetează ID-ul
}

// admin.js (Continuare)

// Funcție pentru a obține toate produsele
function getProducts() {
    return JSON.parse(localStorage.getItem('products')) || [];
}

// Funcție pentru a salva produsele (după o modificare)
function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
    updateCartItemCount(); // Asigură că numărul de produse din coș este actualizat pe toate paginile
}

// Funcție pentru a adăuga/edita un produs
function saveProduct(product) {
    let products = getProducts();
    if (product.id) { // Este o editare
        const index = products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            products[index] = product;
        }
    } else { // Este un produs nou
        product.id = Date.now().toString(); // Generează un ID unic
        products.push(product);
    }
    saveProducts(products);
    displayAdminProducts(); // Reîncarcă lista în panoul de administrare
    showAlert("Produs salvat cu succes!");
    closeProductModal();
}

// Funcție pentru a șterge un produs
function deleteProduct(productId) {
    let products = getProducts();
    // Folosim o modală de confirmare în loc de confirm() de browser
    showAlert(
        "Sunteți sigur că doriți să ștergeți acest produs?",
        "confirm", // Tip de alertă
        () => { // Callback pentru Confirm
            products = products.filter(p => p.id !== productId);
            saveProducts(products);
            displayAdminProducts(); // Reîncarcă lista
            showAlert("Produs șters cu succes!");
        },
        () => { // Callback pentru Anulare
            showAlert("Ștergerea produsului a fost anulată.");
        }
    );
}

// Funcție pentru a deloga utilizatorul
function logoutUser() {
    localStorage.removeItem('loggedInUser');
    showAlert("Ați fost deconectat.");
    setTimeout(() => {
        window.location.href = 'index.html'; // Redirecționează către pagina principală
    }, 1500);
}

// 2. Logică pentru afișarea/ascunderea link-ului de admin/logout în navigație
document.addEventListener('DOMContentLoaded', () => {
    const adminLinkContainer = document.getElementById('admin-link-container');
    if (adminLinkContainer) {
        if (isLoggedIn()) {
            adminLinkContainer.innerHTML = '<li><a href="#" id="logout-nav-btn">Deconectare</a></li>';
            document.getElementById('logout-nav-btn').addEventListener('click', (e) => {
                e.preventDefault(); // Previne navigarea
                logoutUser();
            });
        } else {
            // Afișează link-ul de login doar dacă nu ești pe pagina de login deja
            if (window.location.pathname.indexOf('login.html') === -1) {
                adminLinkContainer.innerHTML = '<li><a href="login.html">Login Admin</a></li>';
            }
        }
    }

    // Logică specifică paginii de LOGIN
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Previne reîncărcarea paginii
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMessageElement = document.getElementById('login-error-message');

            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                localStorage.setItem('loggedInUser', ADMIN_USERNAME);
                showAlert("Autentificare reușită!");
                errorMessageElement.textContent = ''; // Golește orice mesaj de eroare anterior
                setTimeout(() => {
                    window.location.href = 'admin.html'; // Redirecționează către panoul de administrare
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
        // Redirecționează dacă nu ești logat
        if (!isLoggedIn()) {
            showAlert("Nu sunteți autentificat ca administrator! Redirecționare către pagina de login.");
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return; // Oprește execuția ulterioară a scriptului pentru admin
        }

        // Adaugă event listener pentru butonul de deconectare
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logoutUser);
        }

        // admin.js (Continuare)

// ... în interiorul if (adminPanel) { ... } blocul din DOMContentLoaded ...

    // Adaugă event listener pentru butonul "Adaugă Produs Nou"
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => openProductModal());
    }

    // Adaugă event listener pentru butonul de închidere al modalei de produs
    const productModalClose = document.getElementById('product-modal-close');
    if (productModalClose) {
        productModalClose.addEventListener('click', closeProductModal);
    }

    // Adaugă event listener pentru submit-ul formularului de produs
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
                id: productId, // Va fi gol la adăugare, populat la editare
                name,
                description,
                price,
                image
            };

            saveProduct(productData); // Funcția care adaugă/editează
        });
    }

    // Adaugă event listeners pentru butoanele de editare și ștergere (delegare de evenimente)
    // Deoarece aceste butoane sunt generate dinamic, trebuie să folosim delegare de evenimente pe un element părinte.
    const productListAdmin = document.getElementById('product-list-admin');
    if (productListAdmin) {
        productListAdmin.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-product-btn')) {
                const productId = e.target.dataset.id;
                const products = getProducts();
                const productToEdit = products.find(p => p.id === productId);
                if (productToEdit) {
                    openProductModal(productToEdit); // Deschide modala în modul edit
                }
            } else if (e.target.classList.contains('delete-product-btn')) {
                const productId = e.target.dataset.id;
                deleteProduct(productId); // Apelează funcția de ștergere
            }
        });
    }

        // Aici vom adăuga funcționalitatea de afișare/gestionare a produselor
        displayAdminProducts();
    }
});


// Funcție pentru a afișa produsele în panoul de administrare (doar citire deocamdată)
function displayAdminProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productListAdmin = document.getElementById('product-list-admin');

    if (!productListAdmin) return;

    productListAdmin.innerHTML = ''; // Golește lista existentă

    if (products.length === 0) {
        productListAdmin.innerHTML = '<p class="error-message" style="width: 100%; text-align: center;">Niciun produs disponibil. Adaugă produse folosind butonul de mai sus.</p>';
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card', 'admin-product-card'); // Folosim și clasa existentă product-card

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

// Asigură-te că funcția showAlert este disponibilă global, dacă nu este deja în cart.js
// Dacă funcția showAlert este definită doar în cart.js, trebuie să te asiguri că
// fișierul admin.js este încărcat după cart.js în HTML, ceea ce am și făcut.
// Dacă ai scos-o din cart.js, atunci adaug-o aici:
/*
function showAlert(message) {
    const modal = document.getElementById('custom-alert-modal');
    const alertMessage = document.getElementById('alert-message');
    const okButton = document.getElementById('alert-ok-button');

    if (!modal || !alertMessage || !okButton) {
        console.error('Elemente lipsă pentru modala de alertă!');
        return;
    }

    alertMessage.textContent = message;
    modal.classList.add('show');

    const closeAlert = () => {
        modal.classList.remove('show');
        okButton.removeEventListener('click', closeAlert);
        window.removeEventListener('click', clickOutsideAlert);
    };

    okButton.addEventListener('click', closeAlert);

    const clickOutsideAlert = (event) => {
        if (event.target === modal) {
            closeAlert();
        }
    };
    window.addEventListener('click', clickOutsideAlert);
}
*/