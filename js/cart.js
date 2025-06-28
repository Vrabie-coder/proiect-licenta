// js/cart.js

// 1. Funcție pentru a obține coșul curent din Local Storage
function getCart() {
    // localStorage.getItem('shoppingCart') încearcă să citească o valoare de sub cheia 'shoppingCart'.
    // Dacă nu găsește nimic, returnează null.
    const cart = localStorage.getItem('shoppingCart');

    // Operatorul ternar:
    // 'cart ? JSON.parse(cart) : []' înseamnă:
    // Dacă 'cart' (valoarea citită) există (nu e null sau undefined),
    // atunci o parsează din JSON (text) înapoi într-un obiect/array JavaScript.
    // Altfel (dacă e null), returnează un array gol ([]), indicând un coș gol.
    return cart ? JSON.parse(cart) : [];
}

// 2. Funcție pentru a salva coșul în Local Storage
function saveCart(cart) {
    // localStorage.setItem('shoppingCart', JSON.stringify(cart)) salvează un obiect/array JavaScript în Local Storage.
    // Local Storage poate stoca doar string-uri. De aceea, folosim JSON.stringify()
    // pentru a converti array-ul 'cart' într-un string în format JSON.
    // 'shoppingCart' este cheia sub care va fi salvată informația.
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

// Funcție pentru a afișa un pop-up personalizat în loc de alert()
function showAlert(message) {
    const modal = document.getElementById('custom-alert-modal'); // Obține elementul modal principal
    const alertMessageElement = document.getElementById('alert-message'); // Obține elementul unde va fi afișat mesajul
    const closeButton = document.querySelector('.close-button'); // Obține butonul de închidere (X)
    const okButton = document.getElementById('alert-ok-button'); // Obține butonul "OK"

    // Ne asigurăm că toate elementele HTML necesare există înainte de a încerca să le manipulăm
    if (modal && alertMessageElement && closeButton && okButton) {
        alertMessageElement.textContent = message; // Setează textul mesajului în pop-up
        modal.classList.add('show'); // Adaugă clasa 'show' la modal, făcându-l vizibil prin CSS

        // Funcție internă pentru a închide modala
        const closeModal = () => {
            modal.classList.remove('show'); // Elimină clasa 'show', ascunzând modala
            // **Foarte important:** Eliminăm event listener-ele pentru a preveni acumularea lor
            closeButton.removeEventListener('click', closeModal);
            okButton.removeEventListener('click', closeModal);
            window.removeEventListener('click', clickOutsideModal); // Elimină și listener-ul pentru click în afara modalei
        };

        // Adaugă event listener-e pentru închiderea modalei la click pe "X" sau "OK"
        closeButton.addEventListener('click', closeModal);
        okButton.addEventListener('click', closeModal);

        // Adaugă event listener pentru a închide modala dacă se dă click în afara conținutului ei
        const clickOutsideModal = (event) => {
            // Dacă elementul pe care s-a dat click este chiar containerul modal (adică fundalul întunecat)
            if (event.target === modal) {
                closeModal(); // Atunci închide modala
            }
        };
        window.addEventListener('click', clickOutsideModal);
    }
}
// js/cart.js (Continuare)

// Funcție pentru a afișa modala de prompt pentru comandă
function showOrderPrompt() {
    const modal = document.getElementById('order-prompt-modal');
    const customerNameInput = document.getElementById('customer-name-input');
    const submitButton = document.getElementById('order-prompt-submit');
    const cancelButton = document.getElementById('order-prompt-cancel');
    const closeButton = document.getElementById('order-prompt-close');
    const errorMessage = document.getElementById('order-prompt-error');

    if (!modal || !customerNameInput || !submitButton || !cancelButton || !closeButton || !errorMessage) {
        console.error('Elemente lipsă pentru modala de comandă!');
        return; // Oprește execuția dacă elemente cruciale lipsesc
    }

    // Resetăm starea modalei
    customerNameInput.value = ''; // Golește input-ul
    errorMessage.textContent = ''; // Golește mesajele de eroare
    modal.classList.add('show'); // Afișează modala

    // Focus pe input pentru o experiență mai bună
    setTimeout(() => customerNameInput.focus(), 100);


    // Handler pentru submit (Plasează Comanda)
    const handleSubmit = () => {
        const customerName = customerNameInput.value.trim(); // Trim pentru a elimina spațiile goale de la început/sfârșit

        if (customerName === '') {
            errorMessage.textContent = 'Numele este obligatoriu!';
            return;
        }

        // Dacă numele este valid, închidem modala și continuăm cu plasarea comenzii
        closeOrderPrompt(); // Închide modala
        simulateOrderPlacement(customerName); // Apelează funcția de plasare a comenzii cu numele obținut
    };

    // Handler pentru cancel (Anulează)
    const handleCancel = () => {
        closeOrderPrompt(); // Închide modala
        showAlert("Comanda a fost anulată."); // Afișează alertă de anulare (noua modală de alertă)
    };

    // Funcție internă pentru a închide modala și a curăța listener-ele
    const closeOrderPrompt = () => {
        modal.classList.remove('show');
        submitButton.removeEventListener('click', handleSubmit);
        cancelButton.removeEventListener('click', handleCancel);
        closeButton.removeEventListener('click', handleCancel); // X-ul face tot anulare
        window.removeEventListener('click', clickOutsideOrderPrompt);
        customerNameInput.removeEventListener('keypress', handleKeyPress);
    };

    // Adaugă listener-ele
    submitButton.addEventListener('click', handleSubmit);
    cancelButton.addEventListener('click', handleCancel);
    closeButton.addEventListener('click', handleCancel); // "X" face la fel ca Anulează

    // Închide modala dacă se apasă ESC
    const handleKeyPress = (event) => {
        if (event.key === 'Escape') {
            handleCancel();
        } else if (event.key === 'Enter') {
            handleSubmit();
        }
    };
    customerNameInput.addEventListener('keypress', handleKeyPress);


    // Închide modala dacă se dă click în afara ei
    const clickOutsideOrderPrompt = (event) => {
        if (event.target === modal) {
            handleCancel();
        }
    };
    window.addEventListener('click', clickOutsideOrderPrompt);
}

// 3. Funcție pentru a adăuga un produs în coș
function addToCart(productId, productName, productPrice) {
    let cart = getCart(); // Obține coșul curent (poate fi gol sau cu produse)

    let found = false; // Un flag pentru a verifica dacă produsul există deja în coș

    // Iterăm prin fiecare produs din coșul curent
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === productId) { // Dacă găsim produsul cu același ID
            cart[i].quantity++; // Creștem doar cantitatea produsului existent
            found = true; // Setăm flag-ul la true
            break; // Oprim bucla, nu mai căutăm
        }
    }

    // Dacă produsul nu a fost găsit în coș (este un produs nou)
    if (!found) {
        cart.push({ // Adăugăm un nou obiect (produs) în array-ul 'cart'
            id: productId,       // ID-ul unic al produsului
            name: productName,   // Numele produsului
            price: productPrice, // Prețul produsului
            quantity: 1          // Setăm cantitatea inițială la 1
        });
    }

    saveCart(cart); // Salvăm coșul actualizat în Local Storage
    updateCartDisplay(); // Apelăm funcția care actualizează vizual coșul (o vom scrie mai jos)
    updateCartItemCount(); // Apelăm funcția care actualizează contorul din header (o vom scrie mai jos)
    showAlert(`${productName} a fost adăugat în coș!`); // Un mesaj rapid de confirmare pentru utilizator
}

// 4. Funcție pentru a elimina un produs complet din coș (sau a-i reduce cantitatea)
// Deocamdată, o facem să elimine complet produsul din coș.
function removeFromCart(productId) {
    let cart = getCart(); // Obține coșul curent

    // Folosim metoda 'filter()' a array-urilor. Aceasta creează un NOU array
    // care conține doar elementele pentru care funcția de callback returnează 'true'.
    // Aici, păstrăm doar acele elemente unde 'item.id' NU este egal cu 'productId'
    // (adică toate produsele, în afară de cel pe care vrem să-l ștergem).
    cart = cart.filter(item => item.id !== productId);

    saveCart(cart); // Salvăm noul coș (cu produsul șters) în Local Storage
    updateCartDisplay(); // Actualizăm afișajul vizual al coșului
    updateCartItemCount(); // Actualizăm contorul din header
}

// 5. Funcție pentru a goli complet coșul
function clearCart() {
    // localStorage.removeItem('shoppingCart') șterge complet intrarea de sub cheia 'shoppingCart' din Local Storage.
    localStorage.removeItem('shoppingCart');

    updateCartDisplay(); // Actualizăm afișajul vizual (va arăta coș gol)
    updateCartItemCount(); // Actualizăm contorul (va arăta 0)
}

// 6. Funcție pentru a actualiza afișajul vizual al coșului pe pagina cos.html
function updateCartDisplay() {
    const cart = getCart(); // Obține coșul curent
    // document.getElementById() este o metodă JavaScript care găsește un element HTML după ID-ul său.
    const cartItemsContainer = document.getElementById('cart-items'); // Containerul unde vom afișa produsele
    const cartTotalElement = document.getElementById('cart-total'); // Elementul unde vom afișa totalul

    // Verificăm dacă aceste elemente există pe pagina curentă.
    // Sunt prezente doar pe cos.html, deci nu vrem erori pe index.html sau produse.html
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = ''; // Golește conținutul existent în container. Astfel, refacem lista de fiecare dată.

        let total = 0; // Inițializăm totalul coșului

        if (cart.length === 0) { // Dacă array-ul 'cart' este gol
            cartItemsContainer.innerHTML = '<p>Coșul de cumpărături este gol.</p>'; // Afișăm un mesaj
        } else {
            // Dacă există produse, iterăm prin fiecare
            cart.forEach(item => { // 'forEach' este o metodă de array care execută o funcție pentru fiecare element
                const itemElement = document.createElement('div'); // Creăm un nou element HTML 'div'
                itemElement.classList.add('cart-item'); // Adăugăm o clasă CSS 'cart-item' pentru stilizare
                
                // Setăm conținutul HTML al noului 'div'. Folosim "template literals" (backticks ``)
                // pentru a insera variabile direct în string (`${variabila}`).
                itemElement.innerHTML = `
                    <span>${item.name} (x${item.quantity})</span>
                    <span>${(item.price * item.quantity).toFixed(2)} RON</span>
                    <button class="remove-from-cart-btn" data-product-id="${item.id}">Șterge</button>
                `;
                cartItemsContainer.appendChild(itemElement); // Adăugăm noul 'div' ca un copil al containerului '#cart-items'
                total += item.price * item.quantity; // Adunăm la total
            });
        }
        // Actualizăm elementul '#cart-total' cu valoarea totalului calculat
        if (cartTotalElement) {
            cartTotalElement.textContent = total.toFixed(2); // .toFixed(2) formatează numărul la 2 zecimale
        }
    }
}

// 7. Funcție pentru a actualiza contorul de produse din header (exemplu: Coș (3))
function updateCartItemCount() {
    const cart = getCart(); // Obține coșul curent
    // Reduce metoda: parcurge array-ul și aplică o funcție de "acumulare".
    // Aici, calculează suma tuturor cantităților produselor din coș.
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0); // 0 este valoarea inițială a sumei

    const cartCountElement = document.getElementById('cart-item-count'); // Găsește elementul <span> din header
    if (cartCountElement) {
        cartCountElement.textContent = itemCount; // Setează textul span-ului la numărul total de produse
    }
}

// 8. Event Listener-e: Așteptăm ca documentul HTML să fie complet încărcat
document.addEventListener('DOMContentLoaded', () => {
    // document.querySelectorAll('.add-to-cart-btn') găsește TOATE butoanele
    // care au clasa CSS 'add-to-cart-btn' (cele de pe pagina produse.html).
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    // Pentru fiecare buton "Adaugă în Coș" găsit
    addToCartButtons.forEach(button => {
        // Adăugăm un "event listener" care așteaptă un eveniment de 'click'
        button.addEventListener('click', (event) => {
            // 'event.target' este elementul pe care s-a dat click (butonul).
            // 'dataset' este o proprietate care permite accesarea atributelor 'data-*' din HTML.
            // Ex: <button data-product-id="1">... se accesează cu event.target.dataset.productId
            const productId = event.target.dataset.productId;
            const productName = event.target.dataset.productName;
            // parseFloat() convertește string-ul prețului într-un număr zecimal.
            const productPrice = parseFloat(event.target.dataset.productPrice);

            addToCart(productId, productName, productPrice); // Apelăm funcția noastră de adăugare în coș
        });
    });

    // Inițializarea afișajului coșului și a contorului la încărcarea paginii
    // Acestea se apelează O SINGURĂ DATĂ, când pagina se încarcă,
    // pentru a afișa starea curentă a coșului din Local Storage.
    updateCartDisplay();
    updateCartItemCount();
});


// 9. Event Listener pentru butoanele de "Șterge" din coș (folosim "delegare de evenimente")
// Punem listener-ul pe întregul document pentru a detecta clicuri pe butoane
// care ar putea fi adăugate dinamic (JavaScript le creează).
document.addEventListener('click', (event) => {
    // 'event.target.classList.contains()' verifică dacă elementul pe care s-a dat click
    // are clasa CSS 'remove-from-cart-btn'.
    if (event.target.classList.contains('remove-from-cart-btn')) {
        const productId = event.target.dataset.productId; // Obținem ID-ul produsului de șters
        removeFromCart(productId); // Apelăm funcția de ștergere
    }
});

// 10. Funcția pentru simularea plasării comenzii
// Primește acum numele clientului ca parametru
function simulateOrderPlacement(customerName) {
    const cart = getCart(); // Obține coșul curent

    if (cart.length === 0) { // Verifică dacă coșul este gol
        showAlert("Coșul de cumpărături este gol! Adaugă produse înainte de a plasa o comandă.");
        return; // Oprește execuția funcției
    }

    // ... restul codului funcției rămâne la fel ...
    // Construim un obiect cu toate detaliile comenzii pentru afișare
    const orderDetails = {
        id: Date.now().toString(),
        customer: customerName, // Folosim numele primit ca parametru
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        date: new Date().toLocaleString()
    };

    console.log("DETALII COMANDĂ SIMULATĂ:", orderDetails);

    showAlert(`Comanda dumneavoastră a fost plasată cu succes, ${customerName}! Veți fi contactat în curând.`);

    clearCart();
}

// js/cart.js (la sfârșitul fișierului, după blocul "DOMContentLoaded")

// Adaugă event listener pentru butonul "Golește Coșul"
// Verificăm dacă elementul există înainte de a adăuga listener-ul (pentru a nu avea erori pe alte pagini)
const clearCartBtn = document.getElementById('clear-cart-btn');
if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart); // Când se dă click, apelează funcția clearCart
}

// Adaugă event listener pentru butonul "Plasează Comanda"
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', showOrderPrompt); // Acum, click-ul deschide modala
}